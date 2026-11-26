import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/format";
import { COURSE_TYPES, COURSE_TYPE_LABELS } from "@/lib/validations";
import { createCourse } from "@/lib/actions/courses";

async function createCourseAndRedirect(formData: FormData) {
  "use server";
  const id = await createCourse(formData);
  if (id) redirect(`/admin/cursos/${id}`);
}

export default async function AdminCoursesPage() {
  const courses = await prisma.course.findMany({
    include: { _count: { select: { enrollments: { where: { status: "ACTIVA" } } } } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <h1 className="font-display text-3xl text-cocoa mb-6">Cursos y alumnos</h1>

      <div className="rounded-2xl border border-cocoa/10 bg-cream divide-y divide-cocoa/10 mb-8">
        {courses.map((course) => (
          <Link key={course.id} href={`/admin/cursos/${course.id}`} className="flex items-center justify-between px-5 py-4 hover:bg-ivory/40">
            <div>
              <p className="text-sm font-medium text-cocoa">{course.title}</p>
              <p className="text-xs text-ink/40 mt-0.5">
                {COURSE_TYPE_LABELS[course.courseType as keyof typeof COURSE_TYPE_LABELS] ?? course.courseType} ·{" "}
                {course.isPublished ? "Publicado" : "Borrador"} · {course._count.enrollments} alumno(s) activos
              </p>
            </div>
            <span className="text-sm text-ink/60">{formatPrice(course.price) ?? "Sin precio"}</span>
          </Link>
        ))}
        {courses.length === 0 && <p className="text-center text-ink/40 py-8 text-sm">Todavía no hay cursos creados.</p>}
      </div>

      <form action={createCourseAndRedirect} className="rounded-xl border border-dashed border-cocoa/20 p-5 flex flex-wrap gap-3">
        <input name="title" placeholder="Nombre del nuevo curso" className="input flex-1 min-w-[200px]" required />
        <select name="courseType" className="input w-auto" required>
          {COURSE_TYPES.map((t) => (
            <option key={t} value={t}>
              {COURSE_TYPE_LABELS[t]}
            </option>
          ))}
        </select>
        <button type="submit" className="rounded-full bg-cocoa text-cream px-5 py-2.5 text-sm font-medium">
          Crear curso
        </button>
      </form>
    </div>
  );
}
