import type { Metadata } from "next";
import { getSiteSettings } from "@/lib/settings";
import { Section, Container, Eyebrow } from "@/components/ui/Container";
import { WhatsAppButton } from "@/components/whatsapp/WhatsAppButton";
import { InstagramIcon } from "@/components/ui/icons";
import { MapPin, Clock } from "lucide-react";

export const metadata: Metadata = {
  title: "Contacto",
  description: "Contactá a Celeste Platini Pastelería por WhatsApp.",
};

export default async function ContactoPage() {
  const settings = await getSiteSettings();

  return (
    <Section>
      <Container size="narrow">
        <Eyebrow>Contacto</Eyebrow>
        <h1 className="rise font-brand text-6xl sm:text-7xl leading-[0.95] text-cocoa mt-4 mb-4">Hablemos</h1>
        <p className="text-ink/60 mb-10">
          La forma más rápida de hacer una consulta sobre los cursos es por WhatsApp.
        </p>

        <div className="rounded-2xl bg-ivory/50 p-8 space-y-5 mb-8">
          <WhatsAppButton
            phoneNumber={settings.whatsappNumber}
            message="¡Hola, Celeste! Te escribo desde tu página web."
            label="Escribir por WhatsApp"
            size="lg"
          />

          <ul className="space-y-4 pt-4 border-t border-cocoa/10 text-sm text-ink/70">
            {settings.instagramUrl && (
              <li className="flex items-center gap-3">
                <InstagramIcon className="h-4 w-4 text-blush-deep" />
                <a href={settings.instagramUrl} target="_blank" rel="noopener noreferrer" className="hover:text-cocoa">
                  @celesteplatinipasteleria
                </a>
              </li>
            )}
            {settings.location && (
              <li className="flex items-center gap-3">
                <MapPin className="h-4 w-4 text-blush-deep" /> {settings.location}
              </li>
            )}
            {settings.businessHours && (
              <li className="flex items-center gap-3">
                <Clock className="h-4 w-4 text-blush-deep" /> {settings.businessHours}
              </li>
            )}
          </ul>
        </div>
      </Container>
    </Section>
  );
}
