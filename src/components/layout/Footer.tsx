import Link from "next/link";
import { MessageCircle, MapPin, ArrowUpRight } from "lucide-react";
import { InstagramIcon } from "@/components/ui/icons";
import { MAIN_NAV } from "@/lib/nav";
import { buildWhatsAppUrl } from "@/lib/whatsapp";
import { Wordmark } from "@/components/layout/Wordmark";
import type { SiteSettingsData } from "@/lib/settings";

const LEGAL_LINKS = [
  { href: "/legales/terminos", label: "Términos y condiciones" },
  { href: "/legales/privacidad", label: "Política de privacidad" },
  { href: "/legales/cancelaciones", label: "Cancelaciones y devoluciones" },
  { href: "/legales/envios", label: "Envíos y retiros" },
];

function ColumnTitle({ children }: { children: React.ReactNode }) {
  return <p className="text-[11px] uppercase tracking-[0.28em] text-blush mb-5">{children}</p>;
}

export function Footer({ settings }: { settings: SiteSettingsData }) {
  const waUrl = buildWhatsAppUrl(settings.whatsappNumber, "¡Hola, Celeste! Te escribo desde tu página web.");

  return (
    <footer className="relative mt-16 bg-cocoa text-cream/90 overflow-hidden">
      
      <div
        aria-hidden
        className="pointer-events-none absolute -right-40 -top-40 h-[30rem] w-[30rem] rounded-full border border-blush/10"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -right-20 -top-20 h-[22rem] w-[22rem] rounded-full border border-blush/10"
      />

      <div className="relative mx-auto max-w-7xl px-5 sm:px-8 lg:px-10 pt-20 pb-14 grid gap-12 sm:grid-cols-2 lg:grid-cols-12">
        <div className="lg:col-span-4">
          <Wordmark brandName={settings.brandName} tone="light" />
          <p className="mt-6 text-sm text-cream/60 leading-relaxed max-w-xs">
            Cursos online de pastelería
            {settings.location ? ` desde ${settings.location}` : ""}.
          </p>
          <div className="mt-7 flex gap-3">
            {settings.instagramUrl && (
              <a
                href={settings.instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="grid place-items-center h-10 w-10 rounded-full border border-cream/20 text-cream/80 hover:bg-blush hover:text-cocoa hover:border-blush transition-colors"
              >
                <InstagramIcon className="h-4 w-4" />
              </a>
            )}
            {waUrl && (
              <a
                href={waUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="WhatsApp"
                className="grid place-items-center h-10 w-10 rounded-full border border-cream/20 text-cream/80 hover:bg-blush hover:text-cocoa hover:border-blush transition-colors"
              >
                <MessageCircle className="h-4 w-4" />
              </a>
            )}
          </div>
        </div>

        <div className="lg:col-span-3">
          <ColumnTitle>Navegación</ColumnTitle>
          <ul className="space-y-2.5 text-sm">
            {MAIN_NAV.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="text-cream/70 hover:text-blush transition-colors">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="lg:col-span-2">
          <ColumnTitle>Contacto</ColumnTitle>
          <ul className="space-y-3 text-sm text-cream/70">
            {waUrl && (
              <li>
                <a href={waUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 hover:text-blush transition-colors">
                  WhatsApp <ArrowUpRight className="h-3.5 w-3.5" />
                </a>
              </li>
            )}
            {settings.instagramUrl && (
              <li>
                <a href={settings.instagramUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 hover:text-blush transition-colors">
                  Instagram <ArrowUpRight className="h-3.5 w-3.5" />
                </a>
              </li>
            )}
            {settings.location && (
              <li className="flex items-start gap-2">
                <MapPin className="h-4 w-4 mt-0.5 shrink-0 text-blush" /> {settings.location}
              </li>
            )}
          </ul>
        </div>

        <div className="lg:col-span-3">
          <ColumnTitle>Legales</ColumnTitle>
          <ul className="space-y-2.5 text-sm">
            {LEGAL_LINKS.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="text-cream/70 hover:text-blush transition-colors">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
          {settings.paymentMethodsNote && (
            <p className="text-xs text-cream/50 mt-5 leading-relaxed">{settings.paymentMethodsNote}</p>
          )}
        </div>
      </div>

      <div className="relative border-t border-cream/10">
        <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10 py-6 flex flex-col sm:flex-row gap-2 items-center justify-between text-xs text-cream/45">
          <span>
            © {new Date().getFullYear()} {settings.brandName}. Todos los derechos reservados.
          </span>
          <span className="tracking-[0.2em] uppercase">
            Hecho a mano{settings.location ? ` en ${settings.location}` : ""}
          </span>
        </div>
      </div>
    </footer>
  );
}
