import Image from "next/image";
import Link from "next/link";
import { LayoutDashboard, GraduationCap, Users, FileText, Settings } from "lucide-react";
import { SignOutButton } from "@/components/admin/SignOutButton";

const NAV = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/cursos", label: "Cursos", icon: GraduationCap },
  { href: "/admin/alumnos", label: "Alumnos", icon: Users },
  { href: "/admin/contenido", label: "Contenido", icon: FileText },
  { href: "/admin/configuracion", label: "Configuración", icon: Settings },
];

export function AdminShell({ children, userName }: { children: React.ReactNode; userName?: string | null }) {
  return (
    <div className="min-h-screen flex bg-ivory/30">
      <aside className="w-60 shrink-0 border-r border-cocoa/10 bg-cream hidden md:flex flex-col">
        <div className="px-5 py-5 border-b border-cocoa/10">
          <Link href="/admin" className="inline-flex">
            <Image src="/brand/logo-verde.png" alt="Celeste Platini Pastelería" width={588} height={316} className="h-14 w-auto" />
          </Link>
          <p className="text-xs text-ink/40 mt-2">Panel de administración</p>
        </div>
        <nav className="flex-1 py-4">
          {NAV.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-3 px-5 py-2.5 text-sm text-ink/70 hover:bg-blush/20 hover:text-cocoa"
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="px-5 py-4 border-t border-cocoa/10 text-xs text-ink/50">
          <p className="mb-2 truncate">{userName}</p>
          <SignOutButton />
        </div>
      </aside>

      <div className="flex-1 min-w-0">
        <header className="md:hidden flex items-center justify-between px-5 py-4 border-b border-cocoa/10 bg-cream">
          <Link href="/admin" className="inline-flex items-center gap-2">
            <Image src="/brand/logo-verde.png" alt="Celeste Platini Pastelería" width={588} height={316} className="h-9 w-auto" />
            <span className="text-xs text-ink/40">Admin</span>
          </Link>
          <SignOutButton />
        </header>
        <nav className="md:hidden flex overflow-x-auto gap-1 px-3 py-2 border-b border-cocoa/10 bg-cream">
          {NAV.map((item) => (
            <Link key={item.href} href={item.href} className="shrink-0 rounded-full px-3 py-1.5 text-xs text-ink/70 border border-cocoa/10">
              {item.label}
            </Link>
          ))}
        </nav>
        <main className="p-5 sm:p-8 max-w-6xl">{children}</main>
      </div>
    </div>
  );
}
