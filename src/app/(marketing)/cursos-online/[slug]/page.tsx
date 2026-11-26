import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSiteSettings } from "@/lib/settings";
import { Section, Container } from "@/components/ui/Container";
import { PlaceholderImage } from "@/components/ui/PlaceholderImage";
import { CoverCarousel } from "@/components/course/CoverCarousel";
import { readCoverImages } from "@/lib/course-covers";
import { Accordion } from "@/components/ui/Accordion";
import { WhatsAppButton } from "@/components/whatsapp/WhatsAppButton";
import { BuyOnlineForm } from "@/components/checkout/BuyOnlineForm";
import { BuyAccountHint, getBuyerContext } from "@/components/checkout/BuyAccountHint";
import { formatPrice, formatDate } from "@/lib/format";
import { buildDigitalProductMessage } from "@/lib/whatsapp";
import { COURSE_TYPE_LABELS } from "@/lib/validations";
import { isMercadoPagoConfigured } from "@/lib/mercadopago";
import { buyCourseOnline } from "@/lib/actions/payments";
import { PlayCircle, FileDown, Lock } from "lucide-react";

async function getCourse(slug: string) {
  return prisma.course.findUnique({
    where: { slug },
    include: {
      modules: { include: { lessons: { orderBy: { sortOrder: "asc" } } }, orderBy: { sortOrder: "asc" } },
      faqs: { orderBy: { sortOrder: "asc" } },
    },
  });
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const course = await getCourse(slug);
  if (!course) return {};
  return { title: course.title, description: course.summary ?? course.description.slice(0, 160) };
}

export default async function CourseDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [course, settings] = await Promise.all([getCourse(slug), getSiteSettings()]);

  if (!course || !course.isPublished) notFound();
  const buyer = await getBuyerContext(course.id);

  const price = formatPrice(course.price);
  const productUrl = `${process.env.NEXT_PUBLIC_SITE_URL ?? ""}/cursos-online/${course.slug}`;
  const isLive = course.courseType === "VIVO";
  const covers = readCoverImages(course);

  return (
    <Section>
      <Container>
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 mb-14">
          <div className="relative aspect-[4/3] rounded-2xl overflow-hidden">
            {covers.length > 0 ? (
              <CoverCarousel
                images={covers}
                alt={course.title}
                sizes="(min-width: 1024px) 50vw, 100vw"
                interactive
                priority
              />
            ) : (
              <PlaceholderImage className="absolute inset-0" />
            )}
          </div>

          <div>
            <p className="text-xs uppercase tracking-wide text-blush-deep mb-3">
              {COURSE_TYPE_LABELS[course.courseType as keyof typeof COURSE_TYPE_LABELS] ?? course.courseType}
              {course.level ? ` · ${course.level}` : ""}
            </p>
            <h1 className="font-display text-4xl sm:text-5xl leading-[1.05] text-cocoa mb-4">{course.title}</h1>
            {course.modality && <p className="text-sm text-ink/50 mb-2">{course.modality}</p>}
            {course.durationNote && <p className="text-sm text-ink/50 mb-4">{course.durationNote}</p>}

            <p className="text-lg font-medium text-cocoa mb-6">
              {price ? price : course.requiresQuote ? "A presupuestar" : "Consultar precio"}
            </p>

            <p className="text-ink/70 leading-relaxed mb-6">{course.description}</p>

            {isLive && (
              <div className="rounded-xl bg-ivory/60 p-4 mb-6 text-sm text-ink/70 space-y-1">
                {course.liveDate && <p>Fecha: {formatDate(course.liveDate)}</p>}
                {!course.liveDate && <p>Fecha a confirmar.</p>}
                <p className="text-ink/40 text-xs">
                  El enlace de acceso a la clase se comparte una vez confirmada la inscripción.
                </p>
              </div>
            )}

            {course.includesMaterial && (
              <p className="text-sm text-ink/60 mb-2">
                <strong className="text-cocoa">Incluye:</strong> {course.includesMaterial}
              </p>
            )}
            {course.requirements && (
              <p className="text-sm text-ink/60 mb-6">
                <strong className="text-cocoa">Requisitos:</strong> {course.requirements}
              </p>
            )}

            {isMercadoPagoConfigured && course.price && (
              <>
                <BuyAccountHint email={buyer.email} owned={buyer.owned} processing={buyer.processing} slug={course.slug} />
                {buyer.email && !buyer.owned && !buyer.processing && <BuyOnlineForm action={buyCourseOnline.bind(null, course.id)} kind="curso" />}
              </>
            )}
            <div className="flex flex-wrap gap-4">
              <WhatsAppButton
                phoneNumber={settings.whatsappNumber}
                message={buildDigitalProductMessage({ kind: "curso", title: course.title, price: price ?? undefined, productUrl })}
                label={isMercadoPagoConfigured && course.price ? "Consultar por WhatsApp" : "Comprar curso"}
                variant={isMercadoPagoConfigured && course.price ? "secondary" : "whatsapp"}
                size="lg"
              />
            </div>
            <p className="text-xs text-ink/40 mt-4">
              {isMercadoPagoConfigured && course.price
                ? "¿Ya lo compraste y perdiste el link? Escribile a Celeste por WhatsApp y te lo vuelve a pasar."
                : "Coordinás el pago por WhatsApp. Una vez confirmado, Celeste te pasa el acceso al curso."}
            </p>
          </div>
        </div>

        {course.modules.length > 0 && (
          <div className="mb-14">
            <h2 className="font-display text-2xl text-cocoa mb-6">Contenido del curso</h2>
            <div className="space-y-4">
              {course.modules.map((module) => (
                <div key={module.id} className="rounded-xl border border-cocoa/10 overflow-hidden">
                  <p className="bg-ivory/60 px-5 py-3 font-medium text-cocoa">{module.title}</p>
                  <ul className="divide-y divide-cocoa/10">
                    {module.lessons.map((lesson) => (
                      <li key={lesson.id} className="flex items-center gap-3 px-5 py-3 text-sm text-ink/70">
                        {lesson.isFreePreview ? (
                          <PlayCircle className="h-4 w-4 text-blush-deep shrink-0" />
                        ) : (
                          <Lock className="h-4 w-4 text-ink/30 shrink-0" />
                        )}
                        <span className="flex-1">{lesson.title}</span>
                        {lesson.materialUrl && <FileDown className="h-4 w-4 text-ink/30" />}
                        {lesson.durationMinutes && <span className="text-xs text-ink/40">{lesson.durationMinutes} min</span>}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        )}

        {course.faqs.length > 0 && (
          <div className="max-w-2xl">
            <h2 className="font-display text-2xl text-cocoa mb-4">Preguntas frecuentes</h2>
            <Accordion items={course.faqs} />
          </div>
        )}
      </Container>
    </Section>
  );
}
