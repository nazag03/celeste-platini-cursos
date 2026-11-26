import Link from "next/link";
import { UserRound, CheckCircle2 } from "lucide-react";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isAnonymousEmail } from "@/lib/access-links";
import { claimCourseToAccount } from "@/lib/actions/payments";


export async function SaveToAccount({ token }: { token: string }) {
  const [session, link] = await Promise.all([
    auth(),
    prisma.accessLink.findUnique({
      where: { token },
      select: { enrollment: { select: { userId: true, status: true, user: { select: { email: true } }, course: { select: { slug: true } } } } },
    }),
  ]);
  const enrollment = link?.enrollment;
  if (!enrollment || enrollment.status !== "ACTIVA") return null;

  const userId = session?.user?.id;
  const box = "rounded-2xl border border-cocoa/10 bg-ivory/50 p-6 mb-8 text-left";

  if (userId && enrollment.userId === userId) {
    return (
      <div className={`${box} flex items-start gap-3`}>
        <CheckCircle2 className="h-5 w-5 text-green-700 shrink-0 mt-0.5" />
        <p className="text-sm text-ink/70">
          Este curso ya está guardado en tu cuenta.{" "}
          <Link href={`/cuenta/cursos/${enrollment.course.slug}`} className="text-cocoa underline">
            Verlo en Mi cuenta
          </Link>
        </p>
      </div>
    );
  }

  
  if (!isAnonymousEmail(enrollment.user.email)) return null;

  if (userId) {
    return (
      <div className={box}>
        <p className="font-medium text-cocoa mb-1">Guardalo en tu cuenta</p>
        <p className="text-sm text-ink/60 mb-4">
          Así lo tenés siempre en <strong>Mi cuenta</strong> ({session.user.email}), sin depender de este link.
        </p>
        <form action={claimCourseToAccount.bind(null, token)}>
          <button type="submit" className="inline-flex items-center gap-2 rounded-full bg-cocoa text-cream px-5 py-2.5 text-sm font-medium">
            <UserRound className="h-4 w-4" /> Guardar en mi cuenta
          </button>
        </form>
      </div>
    );
  }

  const back = encodeURIComponent(`/compra/${token}`);
  return (
    <div className={box}>
      <p className="font-medium text-cocoa mb-1">Guardalo en tu cuenta</p>
      <p className="text-sm text-ink/60 mb-4">
        Ingresá (o creá tu cuenta) y guardá el curso: lo vas a encontrar en <strong>Mi cuenta</strong> desde cualquier
        dispositivo, aunque pierdas este link.
      </p>
      <div className="flex flex-wrap gap-3">
        <Link
          href={`/cuenta/login?callbackUrl=${back}`}
          className="inline-flex items-center gap-2 rounded-full bg-cocoa text-cream px-5 py-2.5 text-sm font-medium"
        >
          Ingresar
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
