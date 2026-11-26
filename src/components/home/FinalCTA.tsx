import { ArrowRight } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { LinkButton } from "@/components/ui/Button";
import { WhatsAppButton } from "@/components/whatsapp/WhatsAppButton";
import type { SiteSettingsData } from "@/lib/settings";

export function FinalCTA({ settings }: { settings: SiteSettingsData }) {
  return (
    <section className="px-3 sm:px-5 pb-3 sm:pb-5">
      <div className="relative overflow-hidden rounded-[2rem] sm:rounded-[2.5rem] bg-blush grain py-20 sm:py-28">
        <div aria-hidden className="pointer-events-none absolute -top-24 -left-24 h-72 w-72 rounded-full bg-blush-deep/50 blur-3xl" />
        <div aria-hidden className="pointer-events-none absolute -bottom-24 -right-24 h-80 w-80 rounded-full bg-cream/70 blur-3xl" />
        <div aria-hidden className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-[36rem] w-[36rem] rounded-full border border-cocoa/10" />

        <Container size="narrow" className="relative text-center">
          <p className="font-brand text-2xl tracking-[0.12em] text-cocoa/70 mb-4">Hablemos</p>
          <h2 className="reveal font-display text-5xl sm:text-6xl lg:text-7xl leading-[1] text-cocoa mb-6">
            ¿Empezamos a <em className="italic text-cocoa-light">aprender?</em>
          </h2>
          <p className="text-ink/70 text-lg mb-11 max-w-md mx-auto">
            Elegí tu curso, pagá con Mercado Pago y empezá hoy mismo. Si tenés dudas, escribinos.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <LinkButton href="/cursos-online" size="lg">
              Ver cursos online
              <ArrowRight className="h-4 w-4 transition-transform group-hover/btn:translate-x-1" />
            </LinkButton>
            <WhatsAppButton
              phoneNumber={settings.whatsappNumber}
              message="¡Hola, Celeste! Te escribo desde tu página web, quiero hacerte una consulta."
              label="Escribir por WhatsApp"
              size="lg"
            />
          </div>
        </Container>
      </div>
    </section>
  );
}
