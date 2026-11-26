import Link from "next/link";
import { CheckCircle2, UserRound, LogIn, Clock } from "lucide-react";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { reconcilePendingEnrollments } from "@/lib/access";


export async function getBuyerContext(courseId: string) {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return { email: null, owned: false, processing: false };
  const inProgress = await reconcilePendingEnrollments(userId, courseId);
  const enrollment = await prisma.enrollment.findUnique({
    where: { userId_courseId: { userId, courseId } },
    select: { status: true },
  });
  const owned = enrollment?.status === "ACTIVA";
  return { email: session.user.email ?? null, owned, processing: !owned && inProgress.includes(courseId) };
}


export function BuyAccountHint({
  email,
  owned,
  processing,
  slug,
}: {
  email: string | null;
  owned: boolean;
  processing: boolean;
  slug: string;
}) {
  if (owned) {
    return (
      <div className="rounded-2xl border border-green-200 bg-green-50 p-5 mb-4 flex items-start gap-3">
        <CheckCircle2 className="h-5 w-5 text-green-700 shrink-0 mt-0.5" />
        <p className="text-sm text-green-900">
          Ya tenés este curso.{" "}
          <Link href={`/cuenta/cursos/${slug}`} className="underline font-medium">
            Abrirlo en Mi cuenta
          </Link>
        </p>
      </div>
    );
  }

  if (processing) {
    return (
      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 mb-4 flex items-start gap-3">
        <Clock className="h-5 w-5 text-amber-700 shrink-0 mt-0.5" />
        <div className="text-sm text-amber-900">
          <p className="font-medium mb-1">Estamos confirmando tu pago</p>
          <p>
            En unos minutos vas a ver los links con las clases en{" "}
            <Link href="/cuenta" className="underline font-medium">
              Mi cuenta
            </Link>
            . Si pagaste en efectivo (Rapipago, Pago Fácil) puede tardar unas horas.
          </p>
        </div>
      </div>
    );
  }

  if (email) {
    return (
      <p className="flex items-center gap-2 text-xs text-ink/50 mb-3">
        <UserRound className="h-3.5 w-3.5" /> Comprás con tu cuenta {email}: el curso queda guardado en Mi cuenta.
      </p>
    );
  }

  const back = encodeURIComponent(`/cursos-online/${slug}`);
  return (
    <div className="rounded-2xl border border-cocoa/10 bg-ivory/40 p-5 mb-4">
      <p className="font-medium text-cocoa mb-1">Para comprar, ingresá a tu cuenta</p>
      <p className="text-sm text-ink/60 mb-4">
        Así el curso queda guardado en <strong>Mi cuenta</strong> y lo podés ver cuando quieras.
      </p>
      <div className="flex flex-wrap gap-3">
        <Link
          href={`/cuenta/login?callbackUrl=${back}`}
          className="inline-flex items-center gap-2 rounded-full bg-cocoa text-cream px-5 py-2.5 text-sm font-medium"
        >
          <LogIn className="h-4 w-4" /> Ingresar
        </Link>
        <Link
          href={`/cuenta/registro?callbackUrl=${back}`}
          className="inline-flex items-center gap-2 rounded-full border border-cocoa/20 px-5 py-2.5 text-sm font-medium text-cocoa hover:bg-cocoa/5"
        >
          Crear cuenta
        </Link>
      </div>
    </div>
  );
}
