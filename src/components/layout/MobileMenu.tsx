"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowRight, Menu, X } from "lucide-react";
import { clsx } from "clsx";
import { MAIN_NAV } from "@/lib/nav";
import { InstagramIcon } from "@/components/ui/icons";
import { AccountLink } from "@/components/layout/AccountLink";
import { Wordmark } from "@/components/layout/Wordmark";

export function MobileMenu({
  instagramUrl,
  brandName,
}: {
  instagramUrl?: string | null;
  brandName?: string | null;
}) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const close = () => setOpen(false);

  
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div className="xl:hidden">
      <button
        type="button"
        aria-label="Abrir menú"
        aria-expanded={open}
        onClick={() => setOpen(true)}
        className="grid place-items-center h-11 w-11 -mr-2 rounded-full text-cocoa hover:bg-cocoa/5 transition-colors"
      >
        <Menu className="h-6 w-6" strokeWidth={1.5} />
      </button>

      
      {open &&
        createPortal(
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Menú"
            className="xl:hidden fixed inset-0 h-[100dvh] z-[60] bg-cream flex flex-col rise [animation-duration:0.35s]"
          >
            <div className="flex items-center justify-between px-5 sm:px-8 h-[72px] border-b border-cocoa/[0.07] shrink-0">
              <Wordmark brandName={brandName} onClick={close} />
              <button
                type="button"
                aria-label="Cerrar menú"
                onClick={close}
                className="grid place-items-center h-11 w-11 -mr-2 rounded-full text-cocoa hover:bg-cocoa/5 transition-colors"
              >
                <X className="h-6 w-6" strokeWidth={1.5} />
              </button>
            </div>

            <nav
              aria-label="Principal"
              className="flex-1 overflow-y-auto flex flex-col px-5 sm:px-8 py-6"
            >
              {MAIN_NAV.map((item) => {
                const active =
                  item.href === "/"
                    ? pathname === "/"
                    : pathname.startsWith(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={close}
                    aria-current={active ? "page" : undefined}
                    className={clsx(
                      "group flex items-center justify-between py-4 border-b border-cocoa/10 font-display text-[1.65rem] leading-none transition-colors",
                      active ? "text-blush-deep" : "text-cocoa",
                    )}
                  >
                    {item.label}
                    <ArrowRight
                      className="h-5 w-5 opacity-30 transition-all group-hover:opacity-100 group-hover:translate-x-1"
                      strokeWidth={1.5}
                    />
                  </Link>
                );
              })}
              <div onClick={close}>
                <AccountLink variant="mobile" />
              </div>

              <div className="mt-auto pt-10 flex flex-col gap-5">
                <Link
                  href="/cursos-online"
                  onClick={close}
                  className="inline-flex items-center justify-center rounded-full bg-cocoa text-cream py-4 text-[15px] font-medium tracking-wide"
                >
                  Ver cursos
                </Link>
                {instagramUrl && (
                  <a
                    href={instagramUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 text-sm text-cocoa/70"
                  >
                    <InstagramIcon className="h-4 w-4" /> Seguinos en Instagram
                  </a>
                )}
              </div>
            </nav>
          </div>,
          document.body,
        )}
    </div>
  );
}
