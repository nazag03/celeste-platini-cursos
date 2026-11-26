import type { Metadata } from "next";
import Link from "next/link";
import { CheckCircle2, Clock, XCircle, FolderOpen, FileDown, Loader2 } from "lucide-react";
import { getAccessForToken } from "@/lib/access";
import { getSiteSettings } from "@/lib/settings";
import { Section, Container } from "@/components/ui/Container";
import { AnchorButton } from "@/components/ui/Button";
import { CourseLessons } from "@/components/course/CourseLessons";
import { AutoRefresh } from "@/components/checkout/AutoRefresh";
import { materialLinkLabel } from "@/lib/material-links";
import { SaveToAccount } from "@/components/checkout/SaveToAccount";

export const metadata: Metadata = {
  title: "Tu compra",
  robots: { index: false, follow: false },
  
  referrer: "no-referrer",
};


export default async function PurchaseAccessPage({
  params,
  searchParams,
}: {
  params: Promise<{ token: string }>;
  searchParams: Promise<{ estado?: string }>;
}) {
  const [{ token }, { estado }] = await Promise.all([params, searchParams]);
  const [access, settings] = await Promise.all([getAccessForToken(token), getSiteSettings()]);
  const whatsappHref = settings.whatsappNumber
    ? `https://wa.me/${settings.whatsappNumber}?text=${encodeURIComponent("Hola Celeste! Compré un curso/recetario en la web y necesito ayuda con el acceso.")}`
    : null;
  const whatsappLink = whatsappHref ? (
    <a href={whatsappHref} target="_blank" rel="noopener noreferrer" className="text-cocoa underline text-sm">
      Escribirle a Celeste por WhatsApp
    </a>
  ) : null;

  if (access.state === "invalid" || access.state === "revoked") {
    return (
      <Message
        icon={<XCircle className="h-12 w-12 mx-auto mb-5 text-red-700" />}
        title={access.state === "invalid" ? "Este link no es válido" : "Este acceso ya no está activo"}
        text="Si compraste y no podés entrar, escribile a Celeste por WhatsApp con la fecha y hora de tu pago y te pasa el link de nuevo."
      >
        {whatsappLink}
      </Message>
    );
  }

  if (access.state === "pending") {
    if (estado === "fallido") {
      return (
        <Message
          icon={<XCircle className="h-12 w-12 mx-auto mb-5 text-red-700" />}
          title="El pago no se pudo completar"
          text="No se hizo ningún cobro. Podés volver a intentarlo con otra tarjeta o medio de pago."
        >
          <Link href={access.productPath} className="text-cocoa underline text-sm">
            Volver a {access.title}
          </Link>
        </Message>
      );
    }
    return (
      <Message
        icon={<Clock className="h-12 w-12 mx-auto mb-5 text-amber-600" />}
        title="Estamos confirmando tu pago"
        text={`En unos minutos vas a ver los links con las clases de "${access.title}" en Mi cuenta (y también en esta página). Si pagaste en efectivo (Rapipago, Pago Fácil), puede tardar unas horas.`}
      >
        <p className="inline-flex items-center gap-2 text-xs text-ink/50">
          <Loader2 className="h-3.5 w-3.5 animate-spin" /> Actualizando automáticamente...
        </p>
        <AutoRefresh />
        <p className="mt-6">
          <Link href="/cuenta" className="text-cocoa underline text-sm">
            Ir a Mi cuenta
          </Link>
        </p>
      </Message>
    );
  }

  return (
    <Section>
      <Container size="narrow" className="text-center">
        <CheckCircle2 className="h-12 w-12 mx-auto mb-5 text-green-700" />
        <h1 className="font-display text-4xl leading-tight text-cocoa mb-3">¡Pago aprobado!</h1>
        <p className="text-ink/70 mb-8">
          Ya tenés acceso a <strong className="text-cocoa">{access.title}</strong>.
        </p>

        <div className="flex flex-col sm:flex-row sm:flex-wrap justify-center gap-4 mb-6">
          {access.links.map((link, i) => (
            <AnchorButton
              key={link.url + i}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              variant={i === 0 ? "primary" : "secondary"}
              size="lg"
            >
              <FolderOpen className="h-5 w-5" /> {materialLinkLabel(link, i, access.links.length)}
            </AnchorButton>
          ))}
          {access.hasPdf && (
            <AnchorButton href={`/api/compra/${token}/pdf`} variant={access.links.length > 0 ? "secondary" : "primary"} size="lg">
              <FileDown className="h-5 w-5" /> Descargar PDF
            </AnchorButton>
          )}
        </div>

        {access.links.length > 0 && (
          <p className="text-sm text-ink/60 mb-8">
            Ahí vas a encontrar {access.kind === "curso" ? "el material del curso" : "el recetario"}: podés verlo online o
            descargarlo desde Google Drive.
          </p>
        )}

        {access.links.length === 0 && !access.hasPdf && access.modules.length === 0 && (
          <p className="text-sm text-ink/60 mb-8">
            Celeste está terminando de subir el material. Escribile por WhatsApp y te lo pasa enseguida.
          </p>
        )}

        {access.kind === "curso" && <SaveToAccount token={token} />}

        <p className="rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-sm px-4 py-3 mb-4 text-left">
          <strong>Importante:</strong> guardá esta página en favoritos o copiá los links de Google Drive (o guardá el curso en tu cuenta).
          Es tu acceso personal.
        </p>
        <p className="text-xs text-ink/40">Si lo perdés, escribile a Celeste por WhatsApp con la fecha y hora de tu pago.</p>
      </Container>

      {access.modules.length > 0 && (
        <Container className="mt-14">
          <h2 className="font-display text-2xl text-cocoa mb-6">Clases</h2>
          <CourseLessons modules={access.modules} />
        </Container>
      )}
    </Section>
  );
}

function Message({ icon, title, text, children }: { icon: React.ReactNode; title: string; text: string; children?: React.ReactNode }) {
  return (
    <Section>
      <Container size="narrow" className="text-center">
        {icon}
        <h1 className="font-display text-4xl leading-tight text-cocoa mb-4">{title}</h1>
        <p className="text-ink/70 leading-relaxed mb-8">{text}</p>
        {children}
      </Container>
    </Section>
  );
}
