import { Resend } from "resend";
import { isAnonymousEmail } from "@/lib/access-links";

export const isEmailConfigured = Boolean(process.env.RESEND_API_KEY);

let resendClient: Resend | null = null;

function getResendClient(): Resend {
  if (!process.env.RESEND_API_KEY) {
    throw new Error("RESEND_API_KEY no está configurado.");
  }
  if (!resendClient) {
    resendClient = new Resend(process.env.RESEND_API_KEY);
  }
  return resendClient;
}

const FROM = process.env.EMAIL_FROM || "Celeste Platini Pastelería <onboarding@resend.dev>";

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);
}

function layout(body: string) {
  return `
    <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; color: #1e2b1d;">
      ${body}
      <p style="font-size: 13px; color: #6b7f68; margin-top: 32px;">
        Este link es personal: no lo compartas. Si lo perdés, podés pedirlo de nuevo desde la web en "Recuperar mi acceso".
      </p>
      <p style="font-size: 14px; color: #4f664c;">Celeste Platini Pastelería</p>
    </div>
  `;
}

function button(href: string, label: string) {
  return `<p style="margin: 24px 0;"><a href="${href}" style="background:#2e412c; color:#fff8f8; padding: 12px 24px; border-radius: 999px; text-decoration: none;">${label}</a></p>`;
}


async function send(to: string, subject: string, html: string) {
  
  if (isAnonymousEmail(to)) return;
  if (!isEmailConfigured) {
    console.warn(`[email] RESEND_API_KEY no configurado — no se envió "${subject}" a ${to}.`);
    return;
  }
  const { error } = await getResendClient().emails.send({ from: FROM, to, subject, html });
  if (error) throw new Error(`Resend: ${error.message}`);
}

export async function sendCourseAccessEmail(params: { to: string; courseName: string; accessUrl: string }) {
  const name = escapeHtml(params.courseName);
  await send(
    params.to,
    `Tu acceso a "${params.courseName}" ya está listo`,
    layout(`
      <h1 style="font-size: 20px;">¡Listo! Ya tenés acceso a tu curso</h1>
      <p>Confirmamos tu pago de <strong>${name}</strong>. Entrá con este botón para ver y descargar los videos y el material:</p>
      ${button(params.accessUrl, "Ver mi curso")}
      <p style="font-size: 13px; color: #6b7f68;">Guardá este mail: el botón te lleva a tu curso cada vez que quieras verlo.</p>
    `),
  );
}

export async function sendDigitalProductAccessEmail(params: { to: string; productName: string; accessUrl: string }) {
  const name = escapeHtml(params.productName);
  await send(
    params.to,
    `Tu recetario "${params.productName}" ya está listo`,
    layout(`
      <h1 style="font-size: 20px;">¡Gracias por tu compra!</h1>
      <p>Confirmamos tu pago de <strong>${name}</strong>. Entrá con este botón para verlo y descargarlo:</p>
      ${button(params.accessUrl, "Ver mi recetario")}
    `),
  );
}


export async function sendAccessRecoveryEmail(params: {
  to: string;
  items: { title: string; url: string; kind: "curso" | "recetario" }[];
}) {
  const list = params.items
    .map(
      (item) =>
        `<li style="margin-bottom: 12px;"><strong>${escapeHtml(item.title)}</strong> (${item.kind})<br/><a href="${item.url}" style="color:#2e412c;">${item.kind === "curso" ? "Ver curso" : "Ver recetario"}</a></li>`,
    )
    .join("");
  await send(
    params.to,
    "Tus accesos — Celeste Platini Pastelería",
    layout(`
      <h1 style="font-size: 20px;">Acá tenés tus accesos</h1>
      <p>Nos pediste reenviar lo que compraste con este mail:</p>
      <ul style="padding-left: 18px;">${list}</ul>
    `),
  );
}
