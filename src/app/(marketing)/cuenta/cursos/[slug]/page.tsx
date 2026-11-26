import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft, CheckCircle2, FolderOpen } from "lucide-react";
import { CourseLessons } from "@/components/course/CourseLessons";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { reconcilePendingEnrollments } from "@/lib/access";
import { Section, Container } from "@/components/ui/Container";
import { readMaterialLinks, materialLinkLabel } from "@/lib/material-links";

export default async function CourseViewerPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ guardado?: string }>;
}) {
  const [{ slug }, { guardado }] = await Promise.all([params, searchParams]);
  const session = await auth();
  if (!session?.user) redirect(`/cuenta/login?callbackUrl=/cuenta/cursos/${slug}`);

  const course = await prisma.course.findUnique({
    where: { slug },
    include: { modules: { include: { lessons: { orderBy: { sortOrder: "asc" } } }, orderBy: { sortOrder: "asc" } } },
  });
  if (!course) notFound();

  
  
  await reconcilePendingEnrollments(session.user.id, course.id);
  const enrollment = await prisma.enrollment.findUnique({
    where: { userId_courseId: { userId: session.user.id, courseId: course.id } },
  });

  if (!enrollment || enrollment.status !== "ACTIVA") {
    return (
      <Section>
        <Container size="narrow" className="text-center">
          <h1 className="font-display text-2xl text-cocoa mb-4">No tenés acceso a este curso</h1>
          <p className="text-ink/60 mb-6">
            {enrollment?.status === "REVOCADA"
              ? "El acceso a este curso fue revocado."
              : "Todavía no se activó tu acceso. Si ya coordinaste el pago por WhatsApp, esperá la confirmación de Celeste."}
          </p>
          <Link href="/cuenta" className="text-cocoa underline text-sm">
            Volver a mi cuenta
          </Link>
        </Container>
      </Section>
    );
  }

  const links = readMaterialLinks(course.materialLinks);

  return (
    <Section>
      <Container>
        <Link href="/cuenta" className="inline-flex items-center gap-2 text-sm text-ink/50 hover:text-cocoa mb-6">
          <ArrowLeft className="h-4 w-4" /> Mi cuenta
        </Link>
        {guardado && (
          <p className="flex items-center gap-2 rounded-xl bg-green-50 border border-green-200 text-green-800 text-sm px-4 py-3 mb-6">
            <CheckCircle2 className="h-4 w-4 shrink-0" /> ¡Listo! El curso quedó guardado en tu cuenta.
          </p>
        )}
        <h1 className="font-display text-4xl leading-tight text-cocoa mb-8">{course.title}</h1>
        {links.length > 0 && (
          <div className="flex flex-wrap gap-3 mb-10">
            {links.map((link, i) => (
              <a
                key={link.url + i}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full bg-cocoa text-cream px-6 py-3 text-sm font-medium"
              >
                <FolderOpen className="h-4 w-4" /> {materialLinkLabel(link, i, links.length)}
              </a>
            ))}
          </div>
        )}

        <CourseLessons modules={course.modules} />
      </Container>
    </Section>
  );
}
