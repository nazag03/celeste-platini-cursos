import Link from "next/link";
import { prisma } from "@/lib/prisma";

export default async function AdminDashboardPage() {
  const [publishedCourses, activeEnrollments, pendingEnrollments, recentEnrollments] = await Promise.all([
    prisma.course.count({ where: { isPublished: true } }),
    prisma.enrollment.count({ where: { status: "ACTIVA" } }),
    prisma.enrollment.count({ where: { status: "PENDIENTE_PAGO" } }),
    prisma.enrollment.findMany({
      orderBy: { createdAt: "desc" },
      take: 8,
      include: { course: { select: { id: true, title: true } }, user: { select: { name: true, email: true } } },
    }),
  ]);

  return (
    <div>
      <h1 className="font-display text-3xl text-cocoa mb-8">Dashboard</h1>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-10">
        <StatCard label="Cursos publicados" value={publishedCourses} href="/admin/cursos" />
        <StatCard label="Inscripciones activas" value={activeEnrollments} href="/admin/cursos" />
        <StatCard label="Pagos pendientes" value={pendingEnrollments} href="/admin/cursos" />
      </div>

      <div className="rounded-2xl border border-cocoa/10 bg-cream">
        <p className="px-5 py-4 border-b border-cocoa/10 font-medium text-cocoa">Inscripciones recientes</p>
        {recentEnrollments.length === 0 ? (
          <p className="px-5 py-8 text-sm text-ink/50 text-center">Todavía no hay inscripciones.</p>
        ) : (
          <ul className="divide-y divide-cocoa/10">
            {recentEnrollments.map((e) => (
              <li key={e.id}>
                <Link href={`/admin/cursos/${e.course.id}`} className="flex items-center justify-between px-5 py-3 text-sm hover:bg-ivory/40">
                  <span>
                    <span className="text-ink/40 mr-2">{e.course.title}</span>
                    {e.user.name ?? e.user.email}
                  </span>
                  <span className="text-ink/40 text-xs">
                    {e.status === "ACTIVA" ? "Activa" : e.status === "PENDIENTE_PAGO" ? "Pendiente" : e.status} ·{" "}
                    {e.createdAt.toLocaleDateString("es-AR")}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>

      <p className="text-xs text-ink/40 mt-6">
        Estos números se calculan en tiempo real desde la base de datos; no son valores de ejemplo.
      </p>
    </div>
  );
}

function StatCard({ label, value, href }: { label: string; value: number; href: string }) {
  return (
    <Link href={href} className="rounded-xl border border-cocoa/10 bg-cream p-4 block">
      <p className="text-2xl font-display text-cocoa">{value}</p>
      <p className="text-xs text-ink/50 mt-1">{label}</p>
    </Link>
  );
}
