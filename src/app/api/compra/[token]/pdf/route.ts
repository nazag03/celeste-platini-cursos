import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAccessForToken } from "@/lib/access";
import { getPrivateFileDownloadUrl, isStorageConfigured } from "@/lib/storage";


export async function GET(request: Request, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const access = await getAccessForToken(token);
  if (access.state !== "paid" || !access.hasPdf) {
    return NextResponse.redirect(new URL(`/compra/${token}`, request.url));
  }

  const link = await prisma.accessLink.findUnique({
    where: { token },
    include: { purchase: { include: { digitalProduct: true } } },
  });
  const product = link?.purchase?.digitalProduct;
  if (!product?.filePath || !isStorageConfigured) {
    return NextResponse.redirect(new URL(`/compra/${token}`, request.url));
  }

  const upstream = await fetch(getPrivateFileDownloadUrl(product.filePath)).catch(() => null);
  if (!upstream?.ok || !upstream.body) {
    return new NextResponse("No pudimos obtener el archivo. Escribile a Celeste por WhatsApp.", { status: 502 });
  }

  return new NextResponse(upstream.body, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${product.slug}.pdf"`,
      "Cache-Control": "private, no-store",
      "Referrer-Policy": "no-referrer",
    },
  });
}
