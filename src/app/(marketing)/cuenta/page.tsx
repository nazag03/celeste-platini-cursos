import Link from "next/link";
import { redirect } from "next/navigation";
import { auth, signOut } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { reconcilePendingEnrollments } from "@/lib/access";
import { Section, Container } from "@/components/ui/Container";
import { formatPrice } from "@/lib/format";
import { ChangePasswordForm } from "@/components/account/ChangePasswordForm";
import {
  Download,
  PlayCircle,
  LogOut,
  Clock,
  CheckCircle2,
  XCircle,
} from "lucide-react";

const PAGO_BANNERS = {
  exitoso: {
    icon: CheckCircle2,
    className: "bg-[#E4EFE1] text-[#3F6B3A]",
    text: "¡Pago aprobado! Puede tardar unos segundos en reflejarse acá abajo — si no ves tu curso o recetario todavía, actualizá la página en un momento.",
  },
  pendiente: {
    icon: Clock,
    className: "bg-gold/15 text-[#8a6a28]",
    text: "Tu pago quedó pendiente de confirmación (por ejemplo, si elegiste un medio que tarda en acreditarse). En cuanto se confirme, el acceso aparece acá solo.",
  },
  fallido: {
    icon: XCircle,
    className: "bg-[#EFE4E1] text-[#8a4a3a]",
    text: "El pago no se pudo procesar. Podés intentar de nuevo desde la página del curso o recetario, o coordinarlo directamente por WhatsApp.",
  },
} as const;

export default async function CuentaPage({
  searchParams,
}: {
  searchParams: Promise<{ pago?: string }>;
}) {
  const session = await auth();
  if (!session?.user) redirect("/cuenta/login?callbackUrl=/cuenta");

  const { pago } = await searchParams;
  const banner =
    pago && pago in PAGO_BANNERS
      ? PAGO_BANNERS[pago as keyof typeof PAGO_BANNERS]
      : null;

  const inProgress = await reconcilePendingEnrollments(session.user.id);

  const [enrollments, purchases, processingCourses] = await Promise.all([
    prisma.enrollment.findMany({
      where: { userId: session.user.id, status: "ACTIVA" },
      include: { course: true },
    }),
    prisma.purchase.findMany({
      where: { userId: session.user.id, status: "PAGADO" },
      include: {
        digitalProduct: true,
        downloadTokens: { orderBy: { createdAt: "desc" }, take: 1 },
      },
    }),
    inProgress.length > 0
      ? prisma.course.findMany({ where: { id: { in: inProgress } }, select: { id: true, title: true } })
      : Promise.resolve([]),
  ]);

  return (
    <Section>
      <Container size="narrow">
        {banner && (
          <div
            className={`flex items-start gap-3 rounded-xl p-4 mb-8 text-sm ${banner.className}`}
          >
            <banner.icon className="h-4 w-4 mt-0.5 shrink-0" />
            <p>{banner.text}</p>
          </div>
        )}

        <div className="flex items-center justify-between mb-10">
          <div>
            <h1 className="font-display text-4xl leading-tight text-cocoa">
              Mi cuenta
            </h1>
            <p className="text-sm text-ink/50">{session.user.email}</p>
          </div>
          <form
            action={async () => {
              "use server";
              await signOut({ redirectTo: "/" });
            }}
          >
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 text-sm text-ink/50 hover:text-cocoa"
            >
              <LogOut className="h-4 w-4" /> Cerrar sesión
            </button>
          </form>
        </div>

        <section className="mb-10">
          <h2 className="font-display text-xl text-cocoa mb-4">Mis cursos</h2>
          {processingCourses.length > 0 && (
            <div className="space-y-3 mb-3">
              {processingCourses.map((course) => (
                <div
                  key={course.id}
                  className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-900"
                >
                  <Clock className="h-4 w-4 mt-0.5 shrink-0" />
                  <p>
                    <strong>{course.title}</strong>: estamos confirmando tu pago. En unos minutos aparece acá con sus
                    links; actualizá la página en un rato.
                  </p>
                </div>
              ))}
            </div>
          )}
          {enrollments.length === 0 && processingCourses.length === 0 ? (
            <p className="text-sm text-ink/50 rounded-xl bg-ivory/50 p-5">
              Todavía no tenés cursos en tu cuenta. Si compraste sin iniciar
              sesión, abrí el link de tu compra y tocá{" "}
              <strong>Guardar en mi cuenta</strong>. Si coordinaste el pago por
              WhatsApp, Celeste habilita el acceso desde su panel.
            </p>
          ) : (
            <div className="space-y-3">
              {enrollments.map((enr) => (
                <Link
                  key={enr.id}
                  href={`/cuenta/cursos/${enr.course.slug}`}
                  className="flex items-center justify-between rounded-xl border border-cocoa/10 bg-cream px-5 py-4 hover:bg-ivory/30"
                >
                  <span className="font-medium text-cocoa">
                    {enr.course.title}
                  </span>
                  <PlayCircle className="h-5 w-5 text-blush-deep" />
                </Link>
              ))}
            </div>
          )}
        </section>

        {purchases.length > 0 && (
          <section>
            <h2 className="font-display text-xl text-cocoa mb-4">
              Mis recetarios
            </h2>
            <div className="space-y-3">
              {purchases.map((purchase) => {
                const token = purchase.downloadTokens[0];
                const canDownload =
                  token &&
                  token.expiresAt > new Date() &&
                  token.usedCount < token.maxUses;
                return (
                  <div
                    key={purchase.id}
                    className="flex items-center justify-between rounded-xl border border-cocoa/10 bg-cream px-5 py-4"
                  >
                    <div>
                      <p className="font-medium text-cocoa">
                        {purchase.digitalProduct.title}
                      </p>
                      <p className="text-xs text-ink/40">
                        {formatPrice(purchase.digitalProduct.price)}
                      </p>
                    </div>
                    {canDownload ? (
                      <a
                        href={`/api/downloads/${token.token}`}
                        className="inline-flex items-center gap-1.5 text-sm text-cocoa hover:underline"
                      >
                        <Download className="h-4 w-4" /> Descargar
                      </a>
                    ) : (
                      <span className="text-xs text-ink/40">
                        Pedile a Celeste un nuevo enlace
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        )}

        <div className="mt-10">
          <ChangePasswordForm />
        </div>
      </Container>
    </Section>
  );
}
