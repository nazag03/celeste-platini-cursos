import { prisma } from "@/lib/prisma";
import { Section, Container, Eyebrow } from "@/components/ui/Container";
import { Accordion } from "@/components/ui/Accordion";

export async function FAQSection() {
  const faqs = await prisma.fAQ.findMany({
    where: { isPublished: true },
    orderBy: [{ section: "asc" }, { sortOrder: "asc" }],
  });

  if (faqs.length === 0) return null;

  return (
    <Section>
      <Container>
        <div className="grid lg:grid-cols-12 gap-10 lg:gap-12">
          <div className="lg:col-span-4">
            <div className="lg:sticky lg:top-32">
              <Eyebrow>Preguntas frecuentes</Eyebrow>
              <h2 className="reveal font-display text-4xl sm:text-5xl leading-[1.05] text-cocoa mt-4">
                Antes de escribirnos, <em className="italic text-cocoa-light">puede que esto te ayude</em>
              </h2>
            </div>
          </div>
          <div className="lg:col-span-7 lg:col-start-6">
            <Accordion items={faqs} />
          </div>
        </div>
      </Container>
    </Section>
  );
}
