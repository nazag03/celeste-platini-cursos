import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getPrivateFileDownloadUrl, isStorageConfigured } from "@/lib/storage";


function fail(message: string, status: number) {
  const html = `<!doctype html><html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex"><title>Descarga</title></head>
<body style="font-family:sans-serif;max-width:480px;margin:80px auto;padding:0 16px;color:#1e2b1d;text-align:center">
<h1 style="font-size:22px">No se pudo descargar</h1><p>${message}</p>
<p><a href="/recuperar-acceso" style="color:#2e412c">Pedir mi acceso de nuevo</a></p></body></html>`;
  return new NextResponse(html, { status, headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store" } });
}

export async function GET(request: Request, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;

  const downloadToken = await prisma.downloadToken.findUnique({
    where: { token },
    include: { purchase: { include: { digitalProduct: true } } },
  });

  if (!downloadToken) {
    return fail("El link de descarga no es válido.", 404);
  }

  
  
  
  
  
  if (downloadToken.purchase.status !== "PAGADO") {
    return fail("Esta compra todavía no está confirmada.", 403);
  }

  if (downloadToken.expiresAt < new Date()) {
    return fail("El link de descarga venció.", 410);
  }

  if (downloadToken.usedCount >= downloadToken.maxUses) {
    return fail("Este link ya alcanzó el límite de descargas.", 429);
  }

  const filePath = downloadToken.purchase.digitalProduct.filePath;
  if (!filePath) {
    return fail("El archivo todavía no está disponible. Escribile a Celeste por WhatsApp.", 404);
  }

  
  
  
  const upstream = isStorageConfigured
    ? await fetch(getPrivateFileDownloadUrl(filePath)).catch(() => null)
    : null;
  if (!upstream?.ok || !upstream.body) {
    return fail("No pudimos encontrar el archivo. Escribile a Celeste por WhatsApp.", 502);
  }

  await prisma.downloadToken.update({ where: { id: downloadToken.id }, data: { usedCount: { increment: 1 } } });
  await prisma.downloadLog.create({
    data: {
      downloadTokenId: downloadToken.id,
      userId: downloadToken.purchase.userId,
      ipAddress: request.headers.get("x-forwarded-for"),
    },
  });

  const fileName = `${downloadToken.purchase.digitalProduct.slug}.pdf`;

  return new NextResponse(upstream.body, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${fileName}"`,
      "Cache-Control": "private, no-store",
    },
  });
}
