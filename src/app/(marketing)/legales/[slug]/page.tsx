import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Section, Container } from "@/components/ui/Container";
import { AlertTriangle } from "lucide-react";

async function getPage(slug: string) {
  return prisma.legalPage.findUnique({ where: { slug } });
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const page = await getPage(slug);
  return { title: page?.title ?? "Página legal" };
}

export default async function LegalPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const page = await getPage(slug);
  if (!page) notFound();

  return (
    <Section>
      <Container size="narrow">
        <h1 className="font-display text-4xl sm:text-5xl leading-[1.05] text-cocoa mb-6">{page.title}</h1>

        {page.needsReview && (
          <div className="flex items-start gap-3 rounded-xl bg-gold/15 text-[#8a6a28] p-4 mb-8 text-sm">
            <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
            <p>
              Este contenido es un borrador orientativo y todavía necesita revisión y
              adaptación a las condiciones reales del negocio antes de considerarse definitivo.
              No constituye asesoramiento legal.
            </p>
          </div>
        )}

        <div className="whitespace-pre-wrap text-ink/70 leading-relaxed">{page.content}</div>
      </Container>
    </Section>
  );
}
