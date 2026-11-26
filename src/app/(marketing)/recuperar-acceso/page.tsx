import type { Metadata } from "next";
import { Section, Container } from "@/components/ui/Container";
import { RecoverAccessForm } from "@/components/checkout/RecoverAccessForm";

export const metadata: Metadata = {
  title: "Recuperar mi acceso",
  description: "Pedí de nuevo el acceso a tus cursos y recetarios comprados.",
};

export default function RecoverAccessPage() {
  return (
    <Section>
      <Container size="narrow">
        <h1 className="font-display text-4xl leading-tight text-cocoa mb-4">Recuperar mi acceso</h1>
        <p className="text-ink/70 leading-relaxed mb-8">
          Escribí el mail con el que compraste y te reenviamos el acceso a todos tus cursos y recetarios. Por seguridad, el
          acceso solo se manda a ese mail.
        </p>
        <RecoverAccessForm />
      </Container>
    </Section>
  );
}
