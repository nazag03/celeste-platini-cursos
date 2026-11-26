"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { clsx } from "clsx";
import { MAIN_NAV } from "@/lib/nav";

export function NavLinks() {
  const pathname = usePathname();

  return (
    <>
      {MAIN_NAV.slice(1).map((item) => {
        const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={clsx(
              "relative py-2 text-[13px] tracking-wide transition-colors",
              "after:absolute after:left-0 after:right-0 after:bottom-0.5 after:h-px after:bg-blush-deep after:origin-left after:transition-transform after:duration-300",
              active
                ? "text-cocoa after:scale-x-100"
                : "text-cocoa/70 hover:text-cocoa after:scale-x-0 hover:after:scale-x-100"
            )}
          >
            {item.label}
          </Link>
        );
      })}
    </>
  );
}
