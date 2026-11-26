import type { Metadata } from "next";
import Image from "next/image";
import { getCelestePhotoUrl } from "@/lib/celestePhoto";
import { Section, Container, Eyebrow } from "@/components/ui/Container";
import { LinkButton } from "@/components/ui/Button";

export const metadata: Metadata = {
  title: "Sobre Celeste",
  description: "Conocé a Celeste Platini, pastelera y creadora de contenido en San Francisco, Córdoba.",
};

export default function SobreCelestePage() {
  const photo = getCelestePhotoUrl();
  return (
    <Section>
      <Container size="narrow">
        <Eyebrow>Sobre Celeste</Eyebrow>
        <h1 className="rise font-brand text-6xl sm:text-7xl leading-[0.95] text-cocoa mt-4 mb-8">
          Pastelera y creadora de contenido
        </h1>

        {photo && (
          <div className="relative aspect-[3/2] rounded-2xl overflow-hidden mb-10">
            <Image
              src={photo}
              alt="Celeste Platini"
              fill
              quality={95}
              sizes="(min-width: 768px) 48rem, 100vw"
              className="object-cover object-top"
            />
          </div>
        )}

        <div className="prose-like space-y-5 text-ink/70 leading-relaxed">
          <p>
            Celeste Platini se dedica a la pastelería desde San Francisco, Córdoba y hoy
            comparte sus técnicas en cursos online, además de mostrar su trabajo día a día a su comunidad en
            Instagram.
          </p>
        </div>

        <div className="mt-10 flex flex-wrap gap-4">
          <LinkButton href="/cursos-online">Ver sus cursos</LinkButton>
          <LinkButton href="/contacto" variant="secondary">
            Contactar
          </LinkButton>
        </div>
      </Container>
    </Section>
  );
}
