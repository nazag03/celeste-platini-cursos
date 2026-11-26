import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { safeInternalPath } from "@/lib/safe-redirect";
import { RegisterForm } from "@/components/account/RegisterForm";
import { Section, Container } from "@/components/ui/Container";

export default async function CuentaRegistroPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string }>;
}) {
  const [session, { callbackUrl }] = await Promise.all([auth(), searchParams]);
  const target = safeInternalPath(callbackUrl);

  if (session?.user) redirect(target);

  return (
    <Section>
      <Container size="narrow" className="max-w-sm">
        <h1 className="font-display text-4xl leading-tight text-cocoa mb-2 text-center">Creá tu cuenta</h1>
        <p className="text-sm text-ink/50 text-center mb-8">
          Con tu cuenta comprás los cursos y los tenés siempre en <strong>Mi cuenta</strong>.
        </p>
        <RegisterForm callbackUrl={target} />
        <p className="text-xs text-ink/40 text-center mt-3">Anotá tu contraseña: la vas a necesitar para volver a entrar.</p>
        <p className="text-sm text-ink/50 text-center mt-5">
          ¿Ya tenés cuenta?{" "}
          <Link href={`/cuenta/login?callbackUrl=${encodeURIComponent(target)}`} className="text-cocoa underline">
            Ingresá
          </Link>
        </p>
      </Container>
    </Section>
  );
}
