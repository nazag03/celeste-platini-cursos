import Link from "next/link";
import { CheckCircle2, AlertTriangle, Search } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { ANONYMOUS_EMAIL_DOMAIN } from "@/lib/access-links";
import { setStudentPassword } from "@/lib/actions/students";

export default async function AdminStudentsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; ok?: string; error?: string }>;
}) {
  const { q = "", ok, error } = await searchParams;
  const query = q.trim();

  const students = await prisma.user.findMany({
    where: {
      role: "CUSTOMER",
      NOT: { email: { endsWith: `@${ANONYMOUS_EMAIL_DOMAIN}` } },
      ...(query
        ? { OR: [{ email: { contains: query, mode: "insensitive" } }, { name: { contains: query, mode: "insensitive" } }] }
        : {}),
    },
    include: { enrollments: { where: { status: "ACTIVA" }, include: { course: { select: { id: true, title: true } } } } },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return (
    <div className="max-w-3xl">
      <h1 className="font-display text-3xl text-cocoa mb-2">Alumnos</h1>
      <p className="text-sm text-ink/50 mb-6">
        Las cuentas de quienes compran en la página. Si alguien se olvidó la contraseña, buscalo por su mail, ponele una
        nueva y pasásela por WhatsApp. Después la puede cambiar desde <strong>Mi cuenta</strong>.
      </p>

      {ok && (
        <p className="flex items-center gap-2 rounded-xl bg-green-50 border border-green-200 text-green-800 text-sm px-4 py-3 mb-6">
          <CheckCircle2 className="h-4 w-4 shrink-0" /> Listo: se cambió la contraseña de {ok}.
        </p>
      )}
      {error && (
        <p className="flex items-center gap-2 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-sm px-4 py-3 mb-6">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          {error === "corta" ? "La contraseña tiene que tener al menos 8 caracteres." : "No se encontró ese alumno."}
        </p>
      )}

      <form className="flex gap-2 mb-6">
        <input name="q" defaultValue={query} placeholder="Buscar por mail o nombre" className="input flex-1" />
        <button type="submit" className="inline-flex items-center gap-2 rounded-full bg-cocoa text-cream px-5 py-2.5 text-sm">
          <Search className="h-4 w-4" /> Buscar
        </button>
      </form>

      <div className="rounded-2xl border border-cocoa/10 bg-cream divide-y divide-cocoa/10">
        {students.map((student) => (
          <div key={student.id} className="px-5 py-4">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <p className="text-sm font-medium text-cocoa">
                {student.name ?? "Sin nombre"} <span className="font-normal text-ink/50">· {student.email}</span>
              </p>
              <span className={`text-xs ${student.passwordHash ? "text-ink/40" : "text-amber-700"}`}>
                {student.passwordHash ? "Tiene cuenta" : "Sin contraseña todavía"}
              </span>
            </div>
            <p className="text-xs text-ink/50 mt-1">
              {student.enrollments.length === 0
                ? "Sin cursos."
                : student.enrollments.map((e, i) => (
                    <span key={e.id}>
                      {i > 0 && " · "}
                      <Link href={`/admin/cursos/${e.course.id}`} className="underline hover:text-cocoa">
                        {e.course.title}
                      </Link>
                    </span>
                  ))}
            </p>
            <form action={setStudentPassword.bind(null, student.id)} className="flex flex-wrap gap-2 mt-3">
              <input type="hidden" name="q" value={query} />
              <input
                name="password"
                type="text"
                minLength={8}
                required
                autoComplete="off"
                placeholder="Contraseña nueva (mín. 8)"
                className="input text-xs py-1.5 flex-1 min-w-[180px]"
              />
              <button type="submit" className="rounded-full border border-cocoa/20 px-4 py-1.5 text-xs text-cocoa hover:bg-cocoa/5">
                {student.passwordHash ? "Cambiar contraseña" : "Activar cuenta"}
              </button>
            </form>
          </div>
        ))}
        {students.length === 0 && (
          <p className="text-center text-ink/40 py-8 text-sm">{query ? "No hay alumnos con esa búsqueda." : "Todavía no hay alumnos."}</p>
        )}
      </div>
    </div>
  );
}
