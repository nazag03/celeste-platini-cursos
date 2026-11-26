import Link from "next/link";
import { ArrowUpRight, PlayCircle } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { Section, Container, SectionHeading } from "@/components/ui/Container";
import { PlaceholderImage } from "@/components/ui/PlaceholderImage";
import { CoverCarousel } from "@/components/course/CoverCarousel";
import { readCoverImages } from "@/lib/course-covers";
import { LinkButton } from "@/components/ui/Button";
import { formatPrice } from "@/lib/format";
import { COURSE_TYPE_LABELS } from "@/lib/validations";

export async function AcademySection() {
  const courses = await prisma.course.findMany({
    where: { isPublished: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <Section className="bg-ivory">
      <Container>
        <SectionHeading
          eyebrow="Academia online"
          title={
            <>
              Aprendé <em className="italic text-cocoa-light">con Celeste</em>
            </>
          }
          description="Clases online para aprender técnicas de pastelería a tu ritmo, desde tu casa."
        />

        {courses.length === 0 ? (
          <div className="reveal rounded-[2rem] bg-cream border border-cocoa/[0.07] p-10 sm:p-14 text-center">
            <span className="inline-grid place-items-center h-16 w-16 rounded-full bg-blush text-cocoa mb-6">
              <PlayCircle className="h-7 w-7" strokeWidth={1.4} />
            </span>
            <p className="text-ink/65 max-w-md mx-auto leading-relaxed">
              Celeste está preparando sus primeros cursos online. Mientras tanto, podés
              escribirle por WhatsApp para contarte en qué va a consistir la propuesta.
            </p>
            <LinkButton href="/cursos-online" variant="secondary" className="mt-8">
              Más información
            </LinkButton>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {courses.map((course) => (
              <Link
                key={course.id}
                href={`/cursos-online/${course.slug}`}
                className="reveal group block rounded-[1.75rem] overflow-hidden bg-cream border border-cocoa/[0.07] transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_24px_48px_-24px_rgb(46_65_44/0.35)]"
              >
                <div className="relative aspect-[4/3] overflow-hidden">
                  {readCoverImages(course).length > 0 ? (
                    <CoverCarousel
                      images={readCoverImages(course)}
                      alt={course.title}
                      sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
                      className="transition-transform duration-700 group-hover:scale-105"
                    />
                  ) : (
                    <PlaceholderImage className="absolute inset-0" />
                  )}
                  <span className="absolute top-4 left-4 rounded-full bg-cream/90 backdrop-blur px-3 py-1 text-[11px] uppercase tracking-[0.15em] text-cocoa">
                    {COURSE_TYPE_LABELS[course.courseType as keyof typeof COURSE_TYPE_LABELS] ?? course.courseType}
                  </span>
                </div>
                <div className="p-6 flex items-end justify-between gap-4">
                  <div>
                    <h3 className="font-display text-xl xl:text-2xl text-cocoa leading-tight">{course.title}</h3>
                    <p className="text-sm text-cocoa/70 mt-2">{formatPrice(course.price) ?? "A consultar"}</p>
                  </div>
                  <span className="grid place-items-center h-10 w-10 shrink-0 rounded-full border border-cocoa/15 text-cocoa transition-all duration-300 group-hover:bg-cocoa group-hover:text-cream group-hover:rotate-45">
                    <ArrowUpRight className="h-4 w-4" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </Container>
    </Section>
  );
}
