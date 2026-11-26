import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getSiteSettings } from "@/lib/settings";
import { buildWhatsAppUrl } from "@/lib/whatsapp";
import { safeInternalPath } from "@/lib/safe-redirect";
import { CustomerLoginForm } from "@/components/account/CustomerLoginForm";
import { Section, Container } from "@/components/ui/Container";

export default async function CuentaLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string }>;
}) {
  const [session, { callbackUrl }, settings] = await Promise.all([auth(), searchParams, getSiteSettings()]);
  const target = safeInternalPath(callbackUrl);

  if (session?.user) redirect(target);

  const forgotUrl = buildWhatsAppUrl(
    settings.whatsappNumber,
    "¡Hola, Celeste! Me olvidé la contraseña de mi cuenta en la página. Mi mail es: ",
  );
  const registerHref = `/cuenta/registro?callbackUrl=${encodeURIComponent(target)}`;

  return (
    <Section>
      <Container size="narrow" className="max-w-sm">
        <h1 className="font-display text-4xl leading-tight text-cocoa mb-2 text-center">Ingresá a tu cuenta</h1>
        <p className="text-sm text-ink/50 text-center mb-8">Para comprar cursos y verlos cuando quieras.</p>
        <CustomerLoginForm callbackUrl={target} />
        {forgotUrl && (
          <p className="text-xs text-ink/50 text-center mt-4">
            <a href={forgotUrl} target="_blank" rel="noopener noreferrer" className="underline hover:text-cocoa">
              ¿Olvidaste tu contraseña? Escribile a Celeste por WhatsApp
            </a>
          </p>
        )}
        <p className="text-sm text-ink/50 text-center mt-6">
          ¿Todavía no tenés cuenta?{" "}
          <Link href={registerHref} className="text-cocoa underline">
            Creá una
          </Link>
        </p>
      </Container>
    </Section>
  );
}
