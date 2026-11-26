import Link from "next/link";
import type { ComponentPropsWithoutRef } from "react";
import { cn } from "@/lib/cn";

type Variant = "primary" | "secondary" | "ghost" | "whatsapp";
type Size = "default" | "sm" | "lg";

const base =
  "group/btn inline-flex items-center justify-center gap-2 rounded-full font-medium tracking-wide transition-all duration-300 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blush-deep disabled:opacity-50 disabled:pointer-events-none";

const variants: Record<Variant, string> = {
  primary:
    "bg-cocoa text-cream hover:bg-cocoa-light hover:-translate-y-0.5 hover:shadow-[0_10px_24px_-10px_rgb(46_65_44/0.6)] active:translate-y-0 active:scale-[0.98] shadow-sm",
  secondary:
    "bg-transparent text-cocoa border border-cocoa/25 hover:border-cocoa hover:bg-cocoa hover:text-cream active:scale-[0.98]",
  ghost: "bg-transparent text-cocoa hover:bg-cocoa/5",
  whatsapp:
    "bg-[#2fae60] text-white hover:bg-[#268f50] hover:-translate-y-0.5 hover:shadow-[0_10px_24px_-10px_rgb(47_174_96/0.7)] active:translate-y-0 active:scale-[0.98] shadow-sm",
};

const sizes: Record<Size, string> = {
  default: "px-6 py-3 text-sm",
  sm: "px-4 py-2 text-sm",
  lg: "px-8 py-4 text-[15px]",
};

type ButtonOwnProps = {
  variant?: Variant;
  size?: Size;
  className?: string;
};

export function Button({
  variant = "primary",
  size = "default",
  className,
  ...props
}: ButtonOwnProps & ComponentPropsWithoutRef<"button">) {
  return (
    <button className={cn(base, variants[variant], sizes[size], className)} {...props} />
  );
}

export function LinkButton({
  variant = "primary",
  size = "default",
  className,
  href,
  ...props
}: ButtonOwnProps & ComponentPropsWithoutRef<typeof Link> & { href: string }) {
  return (
    <Link href={href} className={cn(base, variants[variant], sizes[size], className)} {...props} />
  );
}

export function AnchorButton({
  variant = "primary",
  size = "default",
  className,
  ...props
}: ButtonOwnProps & ComponentPropsWithoutRef<"a">) {
  return <a className={cn(base, variants[variant], sizes[size], className)} {...props} />;
}
