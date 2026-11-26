import { prisma } from "@/lib/prisma";
import { Section, Container, SectionHeading } from "@/components/ui/Container";
import { BadgeCheck, Star } from "lucide-react";

export async function Testimonials() {
  const testimonials = await prisma.testimonial.findMany({
    where: { isPublished: true },
    orderBy: { sortOrder: "asc" },
    take: 6,
  });

  const heading = (
    <SectionHeading
      eyebrow="Opiniones"
      align="center"
      title={
        <>
          Lo que dicen <em className="italic text-cocoa-light">sus clientes</em>
        </>
      }
    />
  );

  
  if (testimonials.length === 0) return null;

  return (
    <Section className="bg-ivory">
      <Container>
        {heading}
        <div className="columns-1 sm:columns-2 lg:columns-3 gap-6 [&>*]:mb-6">
          {testimonials.map((t) => (
            <figure
              key={t.id}
              className="reveal break-inside-avoid relative rounded-[1.75rem] bg-cream p-8 border border-cocoa/[0.07]"
            >
              <span aria-hidden className="absolute top-3 right-6 font-display text-8xl leading-none text-blush select-none">
                &rdquo;
              </span>
              {t.rating && (
                <div className="relative flex gap-0.5 text-gold mb-5" aria-label={`${t.rating} de 5 estrellas`}>
                  {Array.from({ length: t.rating }).map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-current" />
                  ))}
                </div>
              )}
              <blockquote className="relative font-display text-xl leading-snug text-cocoa">
                {t.content}
              </blockquote>
              <figcaption className="mt-6 pt-5 border-t border-cocoa/10 text-sm font-medium text-cocoa flex items-center gap-3">
                <span className="grid place-items-center h-9 w-9 rounded-full bg-blush text-cocoa font-display text-base">
                  {t.customerName.trim().charAt(0).toUpperCase()}
                </span>
                {t.customerName}
                {t.isVerified && (
                  <span className="ml-auto inline-flex items-center gap-1 text-xs text-cocoa/60 font-normal">
                    <BadgeCheck className="h-3.5 w-3.5 text-blush-deep" /> Verificado
                  </span>
                )}
              </figcaption>
            </figure>
          ))}
        </div>
      </Container>
    </Section>
  );
}
