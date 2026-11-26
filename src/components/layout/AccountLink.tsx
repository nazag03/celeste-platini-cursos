"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { User } from "lucide-react";


export function AccountLink({ variant = "desktop" }: { variant?: "desktop" | "mobile" }) {
  const { data: session } = useSession();
  const href = session?.user ? "/cuenta" : "/cuenta/login";
  const label = session?.user ? "Mi cuenta" : "Ingresar";

  if (variant === "mobile") {
    return (
      <Link href={href} className="py-4 border-b border-cocoa/10 text-cocoa/70 text-base inline-flex items-center gap-2">
        <User className="h-4 w-4" /> {label}
      </Link>
    );
  }

  return (
    <Link href={href} className="inline-flex items-center gap-1.5 text-[13px] tracking-wide text-cocoa/70 hover:text-cocoa transition-colors">
      <User className="h-4 w-4" /> {label}
    </Link>
  );
}
