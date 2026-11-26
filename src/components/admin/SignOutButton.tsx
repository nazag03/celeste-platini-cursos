"use client";

import { signOut } from "next-auth/react";
import { LogOut } from "lucide-react";

export function SignOutButton() {
  return (
    <button
      type="button"
      onClick={() => signOut({ callbackUrl: "/admin/login" })}
      className="inline-flex items-center gap-1.5 text-ink/50 hover:text-cocoa"
    >
      <LogOut className="h-3.5 w-3.5" /> Cerrar sesión
    </button>
  );
}
