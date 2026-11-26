import { Cake } from "lucide-react";
import { clsx } from "clsx";


const TONES = {
  blush: "bg-[radial-gradient(120%_90%_at_30%_20%,var(--color-blush)_0%,var(--color-ivory)_55%,var(--color-cream)_100%)] text-cocoa/45",
  rose: "bg-[radial-gradient(120%_90%_at_70%_15%,var(--color-blush-deep)_0%,var(--color-blush)_50%,var(--color-ivory)_100%)] text-cocoa/50",
  green: "bg-[radial-gradient(120%_90%_at_30%_20%,var(--color-cocoa-light)_0%,var(--color-cocoa)_70%)] text-cream/50",
} as const;

export type PlaceholderTone = keyof typeof TONES;

export function PlaceholderImage({
  label,
  className,
  tone = "blush",
}: {
  label?: string;
  className?: string;
  tone?: PlaceholderTone;
}) {
  return (
    <div className={clsx("flex flex-col items-center justify-center gap-3 overflow-hidden", TONES[tone], className)}>
      <span className="grid place-items-center h-14 w-14 rounded-full border border-current/30">
        <Cake className="h-6 w-6" strokeWidth={1.25} aria-hidden />
      </span>
      <span className="text-[11px] uppercase tracking-[0.2em] px-6 text-center">{label ?? "Foto próximamente"}</span>
    </div>
  );
}
