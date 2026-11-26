import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Section, Container, Eyebrow } from "@/components/ui/Container";
import { PlaceholderImage } from "@/components/ui/PlaceholderImage";
import { CoverCarousel } from "@/components/course/CoverCarousel";
import { readCoverImages } from "@/lib/course-covers";
import { formatPrice } from "@/lib/format";
import { COURSE_TYPE_LABELS } from "@/lib/validations";
import { getSiteSettings } from "@/lib/settings";
import { WhatsAppButton } from "@/components/whatsapp/WhatsAppButton";

export const metadata: Metadata = {
  title: "Cursos online",
  description: "Clases y cursos online de pastelería con Celeste Platini.",
};

export default async function CursosOnlinePage() {
  const [courses, settings] = await Promise.all([
    prisma.course.findMany({ where: { isPublished: true }, orderBy: { createdAt: "desc" } }),
    getSiteSettings(),
  ]);

  return (
    <Section>
      <Container>
        <Eyebrow>Academia online</Eyebrow>
        <h1 className="rise font-brand text-6xl sm:text-7xl leading-[0.95] text-cocoa mt-4 mb-4">Aprendé con Celeste</h1>
        <p className="text-ink/60 max-w-xl mb-12">
          Cursos grabados, clases en vivo y talleres puntuales. Pagás con Mercado Pago y
          recibís el acceso al instante.
        </p>

        {courses.length === 0 ? (
          <div className="rounded-2xl bg-ivory/50 p-10 text-center">
            <p className="text-ink/60 max-w-md mx-auto mb-6">
              Celeste está preparando sus primeros cursos online. Dejanos tu consulta por
              WhatsApp y te avisamos en cuanto estén disponibles.
            </p>
            <WhatsAppButton
              phoneNumber={settings.whatsappNumber}
              message="¡Hola, Celeste! Quiero que me avises cuando tengas cursos online disponibles."
              label="Avisame cuando haya cursos"
            />
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course) => (
              <Link key={course.id} href={`/cursos-online/${course.slug}`} className="group block rounded-2xl overflow-hidden border border-cocoa/10">
                <div className="relative aspect-[4/3]">
                  {readCoverImages(course).length > 0 ? (
                    <CoverCarousel
                      images={readCoverImages(course)}
                      alt={course.title}
                      sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                    />
                  ) : (
                    <PlaceholderImage className="absolute inset-0" />
                  )}
                </div>
                <div className="p-5">
                  <p className="text-xs uppercase tracking-wide text-blush-deep mb-2">
                    {COURSE_TYPE_LABELS[course.courseType as keyof typeof COURSE_TYPE_LABELS] ?? course.courseType}
                  </p>
                  <h3 className="font-display text-lg text-cocoa">{course.title}</h3>
                  {course.summary && <p className="text-sm text-ink/60 mt-2 line-clamp-2">{course.summary}</p>}
                  <p className="text-sm font-medium text-cocoa mt-3">{formatPrice(course.price) ?? "A consultar"}</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </Container>
    </Section>
  );
}
