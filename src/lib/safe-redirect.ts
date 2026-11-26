
export function safeInternalPath(value: string | undefined | null, fallback = "/cuenta"): string {
  if (!value || !value.startsWith("/") || value.startsWith("//") || value.startsWith("/\\")) return fallback;
  return value;
}
