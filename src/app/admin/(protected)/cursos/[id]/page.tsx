import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, X } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { COURSE_TYPES, COURSE_TYPE_LABELS } from "@/lib/validations";
import {
  updateCourse,
  deleteCourse,
  addModule,
  deleteModule,
  addLesson,
  deleteLesson,
  grantCourseAccess,
  revokeCourseAccess,
} from "@/lib/actions/courses";
import {
  accessPageUrl,
  workingLinkToken as validLink,
  isAnonymousEmail,
  formatDateTime,
} from "@/lib/access-links";
import { CopyLink } from "@/components/admin/CopyLink";
import { SaveNotice } from "@/components/admin/SaveNotice";
import { MaterialLinksField } from "@/components/admin/MaterialLinksField";
import { CoverImageField } from "@/components/admin/CoverImageField";
import { readCoverImages } from "@/lib/course-covers";
import { readMaterialLinks } from "@/lib/material-links";

export default async function EditCoursePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ guardado?: string; error?: string; detalle?: string }>;
}) {
  const [{ id }, { guardado, error, detalle }] = await Promise.all([params, searchParams]);

  const course = await prisma.course.findUnique({
    where: { id },
    include: {
      modules: { include: { lessons: { orderBy: { sortOrder: "asc" } } }, orderBy: { sortOrder: "asc" } },
      enrollments: {
        
        where: { NOT: { status: "PENDIENTE_PAGO" } },
        include: { user: true, accessLinks: { orderBy: { createdAt: "desc" } } },
        orderBy: { createdAt: "desc" },
      },
    },
  });
  if (!course) notFound();

  return (
    <div className="max-w-3xl">
      <div className="flex items-center justify-between mb-6">
        <Link href="/admin/cursos" className="inline-flex items-center gap-2 text-sm text-ink/50 hover:text-cocoa">
          <ArrowLeft className="h-4 w-4" /> Volver a cursos
        </Link>
        <form action={deleteCourse.bind(null, course.id)}>
          <button type="submit" className="text-sm text-red-600/70 hover:text-red-600">
            Eliminar curso
          </button>
        </form>
      </div>

      <h1 className="font-display text-3xl text-cocoa mb-8">{course.title}</h1>

      <SaveNotice guardado={guardado} error={error} detalle={detalle} />

      {!course.isPublished && (
        <p className="rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-sm px-4 py-3 mb-6">
          <strong>Este curso es un borrador:</strong> no aparece en la página. Cuando esté listo, marcá{" "}
          <strong>&quot;Publicado&quot;</strong> abajo de todo y tocá <strong>Guardar</strong>.
        </p>
      )}

      <form action={updateCourse.bind(null, course.id)} className="rounded-2xl border border-cocoa/10 bg-cream p-6 space-y-5 mb-8">
        <p className="text-xs text-ink/50">
          Solo el título y la descripción son obligatorios. Para vender online hace falta además el precio.
        </p>
        <div>
          <label className="text-sm font-medium text-cocoa block mb-1.5">Título *</label>
          <input name="title" defaultValue={course.title} className="input" required />
        </div>
        <div>
          <label className="text-sm font-medium text-cocoa block mb-1.5">Descripción *</label>
          <textarea name="description" defaultValue={course.description} rows={4} className="input resize-none" required />
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-cocoa block mb-1.5">Precio</label>
            <input type="number" min={0} step="any" name="price" defaultValue={course.price ?? ""} placeholder="Ej: 15000" className="input" />
          </div>
          <div>
            <label className="text-sm font-medium text-cocoa block mb-1.5">Tipo</label>
            <select name="courseType" defaultValue={course.courseType} className="input">
              {COURSE_TYPES.map((t) => (
                <option key={t} value={t}>
                  {COURSE_TYPE_LABELS[t]}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div>
          <p className="text-sm font-medium text-cocoa mb-1.5">Fotos de portada</p>
          <CoverImageField currentUrls={readCoverImages(course)} />
        </div>
        <div className="rounded-xl bg-ivory/50 p-4">
          <p className="text-sm font-medium text-cocoa mb-1">Links del material (Google Drive)</p>
          <p className="text-xs text-ink/50 mb-3">
            Podés poner varios: por ejemplo el video y el PDF por separado. El nombre es el texto del botón que ve el alumno.
            Es privado: sólo lo ve quien pagó. En Drive, compartí cada archivo como &quot;Cualquier persona con el
            enlace&quot; para que puedan abrirlo.
          </p>
          <MaterialLinksField initialLinks={readMaterialLinks(course.materialLinks)} />
        </div>

        {course.courseType === "VIVO" && (
          <div className="grid sm:grid-cols-2 gap-4 rounded-xl bg-ivory/50 p-4">
            <div>
              <label className="text-sm font-medium text-cocoa block mb-1.5">Fecha y hora</label>
              <input type="datetime-local" name="liveDate" defaultValue={course.liveDate?.toISOString().slice(0, 16) ?? ""} className="input" />
            </div>
            <div>
              <label className="text-sm font-medium text-cocoa block mb-1.5">Enlace de acceso</label>
              <input name="liveAccessLink" defaultValue={course.liveAccessLink ?? ""} className="input" />
            </div>
            <div className="sm:col-span-2">
              <label className="text-sm font-medium text-cocoa block mb-1.5">Instrucciones</label>
              <textarea name="liveInstructions" defaultValue={course.liveInstructions ?? ""} rows={2} className="input resize-none" />
            </div>
          </div>
        )}

        <details className="rounded-xl border border-cocoa/10 p-4 group">
          <summary className="cursor-pointer text-sm font-medium text-cocoa select-none">
            Más detalles (opcional)
          </summary>
          <div className="space-y-5 mt-5">
            <div>
              <label className="text-sm font-medium text-cocoa block mb-1.5">Resumen breve</label>
              <input name="summary" defaultValue={course.summary ?? ""} className="input" />
            </div>
            <div className="grid sm:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium text-cocoa block mb-1.5">Nivel</label>
                <input name="level" defaultValue={course.level ?? ""} placeholder="Inicial, intermedio..." className="input" />
              </div>
              <div>
                <label className="text-sm font-medium text-cocoa block mb-1.5">Modalidad</label>
                <input name="modality" defaultValue={course.modality ?? ""} className="input" />
              </div>
              <div>
                <label className="text-sm font-medium text-cocoa block mb-1.5">Duración</label>
                <input name="durationNote" defaultValue={course.durationNote ?? ""} className="input" />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-cocoa block mb-1.5">Material incluido</label>
              <input name="includesMaterial" defaultValue={course.includesMaterial ?? ""} className="input" />
            </div>
            <div>
              <label className="text-sm font-medium text-cocoa block mb-1.5">Requisitos</label>
              <input name="requirements" defaultValue={course.requirements ?? ""} className="input" />
            </div>
          </div>
        </details>
        <div className="grid grid-cols-2 gap-4">
          <label className="flex items-center gap-2 text-sm text-ink/70">
            <input type="checkbox" name="isFeatured" defaultChecked={course.isFeatured} className="h-4 w-4" /> Destacado
          </label>
          <label className="flex items-center gap-2 text-sm font-medium text-cocoa">
            <input type="checkbox" name="isPublished" defaultChecked={course.isPublished} className="h-4 w-4" /> Publicado
            (visible en la página)
          </label>
        </div>
        <button type="submit" className="rounded-full bg-cocoa text-cream px-5 py-2.5 text-sm font-medium">
          Guardar
        </button>
      </form>

      <div className="rounded-2xl border border-cocoa/10 bg-cream p-6 mb-8">
        <p className="font-display text-lg text-cocoa mb-4">Módulos y lecciones</p>
        <div className="space-y-4 mb-5">
          {course.modules.map((module) => (
            <div key={module.id} className="rounded-xl border border-cocoa/10 p-4">
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-medium text-cocoa">{module.title}</p>
                <form action={deleteModule.bind(null, course.id, module.id)}>
                  <button type="submit" className="text-ink/30 hover:text-red-600">
                    <X className="h-3.5 w-3.5" />
                  </button>
                </form>
              </div>
              <ul className="space-y-1.5 mb-3">
                {module.lessons.map((lesson) => (
                  <li key={lesson.id} className="flex items-center justify-between text-sm text-ink/60">
                    <span>
                      {lesson.title} {lesson.durationMinutes ? `(${lesson.durationMinutes} min)` : ""}
                    </span>
                    <form action={deleteLesson.bind(null, course.id, lesson.id)}>
                      <button type="submit" className="text-ink/30 hover:text-red-600">
                        <X className="h-3 w-3" />
                      </button>
                    </form>
                  </li>
                ))}
              </ul>
              <form action={addLesson.bind(null, course.id, module.id)} className="flex flex-wrap gap-2">
                <input name="title" placeholder="Título de la lección" className="input text-xs py-1.5 flex-1 min-w-[140px]" required />
                <input name="videoUrl" placeholder="URL del video" className="input text-xs py-1.5 flex-1 min-w-[140px]" />
                <input type="number" name="durationMinutes" placeholder="Min." className="input text-xs py-1.5 w-20" />
                <button type="submit" className="text-xs px-3 py-1.5 rounded-full border border-cocoa/20 text-cocoa">
                  Agregar
                </button>
              </form>
            </div>
          ))}
        </div>
        <form action={addModule.bind(null, course.id)} className="flex gap-2">
          <input name="title" placeholder="Nombre del módulo" className="input" />
          <button type="submit" className="rounded-full border border-cocoa/20 px-4 py-2 text-sm text-cocoa whitespace-nowrap">
            Agregar módulo
          </button>
        </form>
      </div>

      <div className="rounded-2xl border border-cocoa/10 bg-cream p-6">
        <p className="font-display text-lg text-cocoa mb-1">Alumnos inscriptos</p>
        <p className="text-xs text-ink/40 mb-5">
          Las compras con Mercado Pago aparecen solas. Si alguien te pagó por WhatsApp, otorgá el acceso abajo con su mail. Si a
          alguien no le llegó el mail, copiá su link de acceso y mandáselo por WhatsApp.
        </p>
        <div className="divide-y divide-cocoa/10 mb-5">
          {course.enrollments.map((enr) => (
            <div key={enr.id} className="flex flex-wrap items-center justify-between gap-2 py-3 text-sm">
              <span>
                {isAnonymousEmail(enr.user.email) ? (
                  <>
                    Compra online <span className="text-ink/40">· {formatDateTime(enr.grantedAt ?? enr.createdAt)}</span>
                  </>
                ) : (
                  <>
                    {enr.user.name ?? enr.user.email} <span className="text-ink/40">({enr.user.email})</span>
                  </>
                )}
                {enr.status === "ACTIVA" && validLink(enr.accessLinks, enr.mpOrderId) && (
                  <span className="block mt-1">
                    <CopyLink url={accessPageUrl(validLink(enr.accessLinks, enr.mpOrderId)!)} />
                  </span>
                )}
              </span>
              <span className="flex items-center gap-3">
                <span className={enr.status === "ACTIVA" ? "text-[#3F6B3A]" : "text-ink/40"}>{enr.status}</span>
                {enr.status === "ACTIVA" && (
                  <form action={revokeCourseAccess.bind(null, course.id, enr.id)}>
                    <button type="submit" className="text-xs text-red-600/70 hover:text-red-600">
                      Revocar
                    </button>
                  </form>
                )}
              </span>
            </div>
          ))}
          {course.enrollments.length === 0 && <p className="text-center text-ink/40 py-6 text-sm">Nadie inscripto todavía.</p>}
        </div>
        <form action={grantCourseAccess.bind(null, course.id)} className="flex flex-wrap gap-3">
          <input name="name" placeholder="Nombre del alumno" className="input flex-1 min-w-[140px]" />
          <input type="email" name="email" placeholder="Correo del alumno" className="input flex-1 min-w-[160px]" required />
          <input name="phone" placeholder="WhatsApp (opcional)" className="input flex-1 min-w-[140px]" />
          <button type="submit" className="rounded-full bg-cocoa text-cream px-5 py-2.5 text-sm">
            Otorgar acceso
          </button>
        </form>
      </div>
    </div>
  );
}
