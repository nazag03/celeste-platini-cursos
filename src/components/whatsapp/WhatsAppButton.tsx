import { MessageCircle } from "lucide-react";
import { buildWhatsAppUrl } from "@/lib/whatsapp";
import { AnchorButton } from "@/components/ui/Button";
import { clsx } from "clsx";

export function WhatsAppButton({
  phoneNumber,
  message,
  label,
  size = "default",
  variant = "whatsapp",
  className,
}: {
  phoneNumber: string | null | undefined;
  message: string;
  label: string;
  size?: "default" | "sm" | "lg";
  variant?: "whatsapp" | "primary" | "secondary" | "ghost";
  className?: string;
}) {
  const url = buildWhatsAppUrl(phoneNumber, message);

  if (!url) {
    return (
      <p className={clsx("text-sm text-ink/50 italic", className)}>
        El contacto por WhatsApp todavía no está configurado. Pronto vas a poder consultar por acá.
      </p>
    );
  }

  return (
    <AnchorButton
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      size={size}
      variant={variant}
      className={className}
    >
      <MessageCircle className="h-4 w-4" aria-hidden />
      {label}
    </AnchorButton>
  );
}
