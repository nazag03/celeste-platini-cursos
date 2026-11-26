"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { clsx } from "clsx";

export function Accordion({ items }: { items: { id: string; question: string; answer: string }[] }) {
  const [openId, setOpenId] = useState<string | null>(items[0]?.id ?? null);

  return (
    <div className="border-t border-cocoa/10">
      {items.map((item) => {
        const isOpen = openId === item.id;
        const panelId = `faq-${item.id}`;
        return (
          <div key={item.id} className="border-b border-cocoa/10">
            <button
              type="button"
              onClick={() => setOpenId(isOpen ? null : item.id)}
              aria-expanded={isOpen}
              aria-controls={panelId}
              className="group w-full flex items-center justify-between gap-6 py-6 text-left"
            >
              <span className="font-display text-xl sm:text-[1.4rem] leading-snug text-cocoa group-hover:text-cocoa-light transition-colors">
                {item.question}
              </span>
              <span
                className={clsx(
                  "grid place-items-center h-9 w-9 shrink-0 rounded-full border transition-all duration-300",
                  isOpen ? "bg-cocoa border-cocoa text-cream rotate-45" : "border-cocoa/20 text-cocoa group-hover:border-cocoa"
                )}
              >
                <Plus className="h-4 w-4" />
              </span>
            </button>
            
            <div
              id={panelId}
              className={clsx(
                "grid transition-[grid-template-rows] duration-300 ease-out",
                isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
              )}
            >
              <div className="overflow-hidden">
                <p className="pb-6 pr-14 text-[15px] text-ink/70 leading-relaxed">{item.answer}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
