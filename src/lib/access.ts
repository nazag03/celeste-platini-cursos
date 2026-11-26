import { prisma } from "@/lib/prisma";
import { newSecretToken, accessPageUrl } from "@/lib/access-links";
import { getOrderClient, isMercadoPagoConfigured, isOrderPaid } from "@/lib/mercadopago";
import { readMaterialLinks, type MaterialLink } from "@/lib/material-links";
import { sendCourseAccessEmail, sendDigitalProductAccessEmail } from "@/lib/email";



export async function createAccessLink(params: { enrollmentId?: string; purchaseId?: string; mpOrderId?: string }) {
  const token = newSecretToken();
  await prisma.accessLink.create({
    data: {
      token,
      enrollmentId: params.enrollmentId ?? null,
      purchaseId: params.purchaseId ?? null,
      mpOrderId: params.mpOrderId ?? null,
    },
  });
  return token;
}


async function linkTokenForOrder(params: { enrollmentId?: string; purchaseId?: string; mpOrderId: string }) {
  const existing = await prisma.accessLink.findUnique({ where: { mpOrderId: params.mpOrderId } });
  if (existing) return existing.token;
  return createAccessLink({ enrollmentId: params.enrollmentId, purchaseId: params.purchaseId });
}


export async function grantEnrollmentFromPaidOrder(enrollmentId: string, mpOrderId: string) {
  const enrollment = await prisma.enrollment.findUnique({
    where: { id: enrollmentId },
    include: { user: true, course: true },
  });
  if (!enrollment) {
    console.error(`[pago] enrollment ${enrollmentId} no existe (order ${mpOrderId}).`);
    return;
  }

  
  const { count } = await prisma.enrollment.updateMany({
    where: { id: enrollmentId, status: "PENDIENTE_PAGO" },
    data: { status: "ACTIVA", grantedAt: new Date(), grantedByAdmin: "mercadopago", mpOrderId },
  });
  if (count === 0) return;

  const token = await linkTokenForOrder({ enrollmentId, mpOrderId });
  await sendCourseAccessEmail({
    to: enrollment.user.email,
    courseName: enrollment.course.title,
    accessUrl: accessPageUrl(token),
  }).catch((err) => console.error("[pago] error enviando mail de curso:", err));
}


export async function grantPurchaseFromPaidOrder(purchaseId: string, mpOrderId: string) {
  const purchase = await prisma.purchase.findUnique({
    where: { id: purchaseId },
    include: { user: true, digitalProduct: true },
  });
  if (!purchase) {
    console.error(`[pago] purchase ${purchaseId} no existe (order ${mpOrderId}).`);
    return;
  }

  const { count } = await prisma.purchase.updateMany({
    where: { id: purchaseId, status: "PENDIENTE_PAGO" },
    data: { status: "PAGADO", grantedAt: new Date(), grantedByAdmin: "mercadopago", mpOrderId },
  });
  if (count === 0) return;

  const token = await linkTokenForOrder({ purchaseId, mpOrderId });
  await sendDigitalProductAccessEmail({
    to: purchase.user.email,
    productName: purchase.digitalProduct.title,
    accessUrl: accessPageUrl(token),
  }).catch((err) => console.error("[pago] error enviando mail de recetario:", err));
}

type Lesson = { id: string; title: string; videoUrl: string | null; materialUrl: string | null; durationMinutes: number | null };

export type AccessResult =
  | { state: "invalid" }
  | { state: "revoked"; title: string }
  | { state: "pending"; title: string; productPath: string }
  | {
      state: "paid";
      kind: "curso" | "recetario";
      title: string;
      links: MaterialLink[];
      hasPdf: boolean;
      modules: { id: string; title: string; lessons: Lesson[] }[];
    };


export async function getAccessForToken(token: string): Promise<AccessResult> {
  if (!token || token.length < 20) return { state: "invalid" };

  const link = await prisma.accessLink.findUnique({
    where: { token },
    include: {
      enrollment: {
        include: {
          course: {
            include: {
              modules: { include: { lessons: { orderBy: { sortOrder: "asc" } } }, orderBy: { sortOrder: "asc" } },
            },
          },
        },
      },
      purchase: { include: { digitalProduct: true } },
    },
  });
  if (!link) return { state: "invalid" };

  const enrollment = link.enrollment;
  const purchase = link.purchase;
  if (!enrollment && !purchase) return { state: "invalid" };

  const title = enrollment?.course.title ?? purchase!.digitalProduct.title;
  const productPath = enrollment ? `/cursos-online/${enrollment.course.slug}` : `/recetarios/${purchase!.digitalProduct.slug}`;
  const status = enrollment?.status ?? purchase!.status;
  const itemOrderId = enrollment?.mpOrderId ?? purchase!.mpOrderId;

  if (status === "REVOCADA" || status === "CANCELADO") return { state: "revoked", title };

  const granted = status === "ACTIVA" || status === "PAGADO";
  let paid: boolean;

  if (!link.mpOrderId) {
    
    paid = granted;
  } else if (granted) {
    paid = itemOrderId === link.mpOrderId;
  } else {
    paid = false;
    if (isMercadoPagoConfigured) {
      const order = await getOrderClient()
        .get({ id: link.mpOrderId })
        .catch(() => null);
      if (order && isOrderPaid(order)) {
        if (enrollment) await grantEnrollmentFromPaidOrder(enrollment.id, link.mpOrderId);
        else await grantPurchaseFromPaidOrder(purchase!.id, link.mpOrderId);
        paid = true;
      }
    }
  }

  if (!paid) return { state: "pending", title, productPath };

  if (enrollment) {
    return {
      state: "paid",
      kind: "curso",
      title,
      links: readMaterialLinks(enrollment.course.materialLinks),
      hasPdf: false,
      modules: enrollment.course.modules,
    };
  }
  return {
    state: "paid",
    kind: "recetario",
    title,
    links: purchase!.digitalProduct.driveUrl ? [{ label: "", url: purchase!.digitalProduct.driveUrl }] : [],
    hasPdf: Boolean(purchase!.digitalProduct.filePath),
    modules: [],
  };
}


const ORDER_IN_PROGRESS = new Set(["processing", "action_required"]);


export async function reconcilePendingEnrollments(userId: string, courseId?: string): Promise<string[]> {
  if (!isMercadoPagoConfigured) return [];
  const pending = await prisma.enrollment.findMany({
    where: {
      userId,
      status: "PENDIENTE_PAGO",
      mpOrderId: { not: null },
      updatedAt: { gte: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000) },
      ...(courseId ? { courseId } : {}),
    },
    select: { id: true, courseId: true, mpOrderId: true },
    orderBy: { updatedAt: "desc" },
    take: 5,
  });
  const inProgress: string[] = [];
  await Promise.all(
    pending.map(async (enrollment) => {
      const order = await getOrderClient()
        .get({ id: enrollment.mpOrderId! })
        .catch(() => null);
      if (!order) return;
      if (isOrderPaid(order)) await grantEnrollmentFromPaidOrder(enrollment.id, enrollment.mpOrderId!);
      else if (order.status && ORDER_IN_PROGRESS.has(order.status)) inProgress.push(enrollment.courseId);
    }),
  );
  return inProgress;
}
