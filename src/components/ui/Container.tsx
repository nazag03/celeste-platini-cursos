import { clsx } from "clsx";

export function Container({
  children,
  className,
  size = "default",
}: {
  children: React.ReactNode;
  className?: string;
  size?: "default" | "wide" | "narrow";
}) {
  return (
    <div
      className={clsx(
        "mx-auto px-5 sm:px-8 lg:px-10",
        size === "default" && "max-w-7xl",
        size === "wide" && "max-w-[90rem]",
        size === "narrow" && "max-w-3xl",
        className
      )}
    >
      {children}
    </div>
  );
}

export function Section({
  children,
  className,
  id,
}: {
  children: React.ReactNode;
  className?: string;
  id?: string;
}) {
  return (
    <section id={id} className={clsx("py-16 sm:py-20 lg:py-24", className)}>
      {children}
    </section>
  );
}

export function Eyebrow({
  children,
  tone = "default",
  className,
}: {
  children: React.ReactNode;
  tone?: "default" | "light";
  className?: string;
}) {
  return (
    <p
      className={clsx(
        "inline-flex items-center gap-3 text-[11px] font-medium uppercase tracking-[0.28em]",
        tone === "light" ? "text-blush" : "text-cocoa/70",
        className
      )}
    >
      <span aria-hidden className="h-px w-8 bg-blush-deep" />
      {children}
    </p>
  );
}


export function SectionHeading({
  eyebrow,
  title,
  description,
  action,
  align = "left",
  tone = "default",
  className,
}: {
  eyebrow?: React.ReactNode;
  title: React.ReactNode;
  description?: React.ReactNode;
  action?: React.ReactNode;
  align?: "left" | "center";
  tone?: "default" | "light";
  className?: string;
}) {
  const centered = align === "center";
  return (
    <div
      className={clsx(
        "reveal mb-12 lg:mb-14 flex gap-6",
        centered ? "flex-col items-center text-center" : "flex-col lg:flex-row lg:items-end lg:justify-between",
        className
      )}
    >
      <div className={clsx(centered && "flex flex-col items-center")}>
        {eyebrow && <Eyebrow tone={tone}>{eyebrow}</Eyebrow>}
        <h2
          className={clsx(
            "font-display text-4xl sm:text-5xl leading-[1.05] mt-4 max-w-2xl",
            tone === "light" ? "text-cream" : "text-cocoa"
          )}
        >
          {title}
        </h2>
        {description && (
          <p
            className={clsx(
              "mt-5 max-w-xl leading-relaxed",
              tone === "light" ? "text-cream/70" : "text-ink/65"
            )}
          >
            {description}
          </p>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
