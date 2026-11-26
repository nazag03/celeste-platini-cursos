import { randomBytes } from "crypto";



export function siteUrl() {
  return process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
}


export const ANONYMOUS_EMAIL_DOMAIN = "compras.invalid";

export function isAnonymousEmail(email: string) {
  return email.endsWith(`@${ANONYMOUS_EMAIL_DOMAIN}`);
}


export function formatDateTime(date: Date) {
  return date.toLocaleString("es-AR", {
    timeZone: "America/Argentina/Buenos_Aires",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}


export function newSecretToken() {
  return randomBytes(24).toString("base64url");
}


export function parseLinkField(value: FormDataEntryValue | null): string | null | "invalid" {
  const raw = String(value ?? "").trim();
  if (!raw) return null;
  const withProtocol = /^[a-z][a-z0-9+.-]*:\/\//i.test(raw) ? raw : `https://${raw}`;
  try {
    const url = new URL(withProtocol);
    if (url.protocol !== "https:" || !url.hostname.includes(".")) return "invalid";
    return url.toString();
  } catch {
    return "invalid";
  }
}


export function workingLinkToken(links: { token: string; mpOrderId: string | null }[], paidOrderId: string | null) {
  return links.find((l) => !l.mpOrderId || l.mpOrderId === paidOrderId)?.token ?? null;
}


export function accessPageUrl(token: string) {
  return `${siteUrl()}/compra/${token}`;
}
