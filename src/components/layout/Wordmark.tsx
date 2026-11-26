import Image from "next/image";
import Link from "next/link";
import { clsx } from "clsx";


export function Wordmark({
  brandName,
  tone = "default",
  className,
  onClick,
}: {
  brandName?: string | null;
  tone?: "default" | "light";
  className?: string;
  onClick?: () => void;
}) {
  const name = brandName?.trim() || "Celeste Platini Pastelería";

  return (
    <Link href="/" onClick={onClick} aria-label={`${name} — inicio`} className={clsx("inline-flex shrink-0", className)}>
      <Image
        src={tone === "light" ? "/brand/logo-rosa.png" : "/brand/logo-verde.png"}
        alt={name}
        width={588}
        height={316}
        priority={tone === "default"}
        className={clsx("w-auto", tone === "light" ? "h-20 sm:h-24" : "h-12 lg:h-14")}
      />
    </Link>
  );
}
