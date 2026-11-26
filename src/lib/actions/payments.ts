"use server";

import { randomUUID } from "crypto";
import { redirect } from "next/navigation";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { siteUrl, newSecretToken, accessPageUrl, ANONYMOUS_EMAIL_DOMAIN, isAnonymousEmail } from "@/lib/access-links";
import { createAccessLink } from "@/lib/access";
import { getOrderClient, isMercadoPagoConfigured } from "@/lib/mercadopago";
import { sendAccessRecoveryEmail } from "@/lib/email";
import { auth } from "@/lib/auth";

export type BuyState = { error?: string; notice?: string } | null;


async function createAnonymousBuyer() {
  return prisma.user.create({
    data: { email: `compra-${randomUUID()}@${ANONYMOUS_EMAIL_DOMAIN}`, role: "CUSTOMER" },
  });
}


async function startCheckout(params: {
  item: { enrollmentId: string } | { purchaseId: string };
  reference: string;
  title: string;
  price: number;
}) {
  const base = siteUrl();
  const token = newSecretToken();
  const returnUrl = `${base}/compra/${token}`;

  const order = await getOrderClient().create({
    body: {
      type: "online",
      processing_mode: "manual",
      total_amount: params.price.toFixed(2),
      external_reference: params.reference,
      description: params.title,
      currency: "ARS",
      items: [{ title: params.title, unit_price: params.price.toFixed(2), quantity: 1 }],
      config: {
        online: {
          callback_url: `${base}/api/webhooks/mercadopago`,
          success_url: returnUrl,
          failure_url: `${returnUrl}?estado=fallido`,
          pending_url: returnUrl,
          auto_return: "approved",
        },
      },
    },
    
    
    requestOptions: { idempotencyKey: randomUUID() },
  });
  if (!order.checkout_url || !order.id) {
    throw new Error("Mercado Pago no devolvió una URL de pago válida.");
  }

  await prisma.accessLink.create({ data: { token, mpOrderId: order.id, ...params.item } });
  return { orderId: order.id, checkoutUrl: order.checkout_url };
}


// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function buyCourseOnline(courseId: string, _prev: BuyState, _formData: FormData): Promise<BuyState> {
  if (!isMercadoPagoConfigured) return { error: "El pago online todavía no está disponible." };

  const course = await prisma.course.findUnique({ where: { id: courseId } });
  if (!course || !course.isPublished || !course.price) {
    return { error: "Este curso no está disponible para pagar online." };
  }

  
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) redirect(`/cuenta/login?callbackUrl=${encodeURIComponent(`/cursos-online/${course.slug}`)}`);

  const existing = await prisma.enrollment.findUnique({
    where: { userId_courseId: { userId, courseId } },
  });
  if (existing?.status === "ACTIVA") redirect(`/cuenta/cursos/${course.slug}`);
  
  const enrollment = existing
    ? await prisma.enrollment.update({ where: { id: existing.id }, data: { status: "PENDIENTE_PAGO" } })
    : await prisma.enrollment.create({ data: { userId, courseId, status: "PENDIENTE_PAGO" } });

  const { orderId, checkoutUrl } = await startCheckout({
    item: { enrollmentId: enrollment.id },
    reference: `enrollment_${enrollment.id}`,
    title: course.title,
    price: course.price,
  });
  await prisma.enrollment.update({ where: { id: enrollment.id }, data: { mpOrderId: orderId } });

  redirect(checkoutUrl);
}


export async function buyDigitalProductOnline(
  digitalProductId: string,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _prev: BuyState,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _formData: FormData,
): Promise<BuyState> {
  if (!isMercadoPagoConfigured) return { error: "El pago online todavía no está disponible." };

  const product = await prisma.digitalProduct.findUnique({ where: { id: digitalProductId } });
  if (!product || !product.isPublished || !product.price) {
    return { error: "Este recetario no está disponible para pagar online." };
  }

  const buyer = await createAnonymousBuyer();
  const purchase = await prisma.purchase.create({
    data: { userId: buyer.id, digitalProductId, status: "PENDIENTE_PAGO" },
  });

  const { orderId, checkoutUrl } = await startCheckout({
    item: { purchaseId: purchase.id },
    reference: `purchase_${purchase.id}`,
    title: product.title,
    price: product.price,
  });
  await prisma.purchase.update({ where: { id: purchase.id }, data: { mpOrderId: orderId } });

  redirect(checkoutUrl);
}

const emailSchema = z.string().trim().toLowerCase().email("Revisá el mail: parece que tiene un error.");


const lastRecoveryByEmail = new Map<string, number>();
const RECOVERY_COOLDOWN_MS = 60_000;


export async function resendAccess(_prev: BuyState, formData: FormData): Promise<BuyState> {
  const parsed = emailSchema.safeParse(String(formData.get("email") ?? ""));
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  const email = parsed.data;
  const genericNotice = {
    notice: "Si hay compras con ese mail, en unos minutos te llega un correo con tus accesos. Revisá también la carpeta de spam.",
  };

  const last = lastRecoveryByEmail.get(email);
  if (last && Date.now() - last < RECOVERY_COOLDOWN_MS) return genericNotice;
  lastRecoveryByEmail.set(email, Date.now());

  const user = await prisma.user.findUnique({
    where: { email },
    include: {
      enrollments: { where: { status: "ACTIVA" }, include: { course: true } },
      purchases: { where: { status: "PAGADO" }, include: { digitalProduct: true } },
    },
  });
  if (!user || (user.enrollments.length === 0 && user.purchases.length === 0)) return genericNotice;

  const items: { title: string; url: string; kind: "curso" | "recetario" }[] = [];
  for (const enrollment of user.enrollments) {
    const token = await createAccessLink({ enrollmentId: enrollment.id });
    items.push({ title: enrollment.course.title, url: accessPageUrl(token), kind: "curso" });
  }
  for (const purchase of user.purchases) {
    const token = await createAccessLink({ purchaseId: purchase.id });
    items.push({ title: purchase.digitalProduct.title, url: accessPageUrl(token), kind: "recetario" });
  }

  await sendAccessRecoveryEmail({ to: email, items }).catch((err) => console.error("[recuperar-acceso] error:", err));
  return genericNotice;
}


export async function claimCourseToAccount(token: string): Promise<void> {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) redirect(`/cuenta/login?callbackUrl=${encodeURIComponent(`/compra/${token}`)}`);

  const link = await prisma.accessLink.findUnique({
    where: { token },
    include: { enrollment: { include: { user: true, course: true } } },
  });
  const enrollment = link?.enrollment;
  if (!enrollment || enrollment.status !== "ACTIVA") redirect(`/compra/${token}`);
  if (enrollment.userId === userId) redirect(`/cuenta/cursos/${enrollment.course.slug}`);
  if (!isAnonymousEmail(enrollment.user.email)) redirect(`/compra/${token}`);

  const current = await prisma.enrollment.findUnique({
    where: { userId_courseId: { userId, courseId: enrollment.courseId } },
  });
  if (current?.status === "ACTIVA") redirect(`/cuenta/cursos/${enrollment.course.slug}`);

  await prisma.$transaction(async (tx) => {
    
    if (current) await tx.enrollment.delete({ where: { id: current.id } });
    await tx.enrollment.updateMany({
      where: { id: enrollment.id, userId: enrollment.userId },
      data: { userId },
    });
  });

  redirect(`/cuenta/cursos/${enrollment.course.slug}?guardado=1`);
}
