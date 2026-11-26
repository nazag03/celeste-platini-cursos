import { NextResponse } from "next/server";
import { WebhookSignatureValidator, InvalidWebhookSignatureError } from "mercadopago";
import { getOrderClient, isOrderPaid, isMercadoPagoConfigured } from "@/lib/mercadopago";
import { grantEnrollmentFromPaidOrder, grantPurchaseFromPaidOrder } from "@/lib/access";


export async function POST(request: Request) {
  const url = new URL(request.url);
  const dataId = url.searchParams.get("data.id") ?? url.searchParams.get("id");

  if (!isMercadoPagoConfigured) {
    return NextResponse.json({ received: true });
  }

  const secret = process.env.MP_WEBHOOK_SECRET;
  if (!secret) {
    console.error("[mp-webhook] MP_WEBHOOK_SECRET no configurado: se ignora la notificación por seguridad.");
    return NextResponse.json({ received: true });
  }

  try {
    
    
    
    
    
    
    
    
    WebhookSignatureValidator.validate({
      xSignature: request.headers.get("x-signature"),
      xRequestId: request.headers.get("x-request-id"),
      dataId,
      secret,
    });
  } catch (err) {
    if (err instanceof InvalidWebhookSignatureError) {
      console.error("[mp-webhook] firma inválida:", err.reason);
      return NextResponse.json({ error: "invalid signature" }, { status: 401 });
    }
    throw err;
  }

  if (!dataId) {
    return NextResponse.json({ received: true });
  }

  let order;
  try {
    order = await getOrderClient().get({ id: dataId });
  } catch (err) {
    
    
    console.warn(`[mp-webhook] no se pudo obtener la order ${dataId}:`, err);
    return NextResponse.json({ received: true });
  }

  if (!isOrderPaid(order)) {
    return NextResponse.json({ received: true });
  }

  
  
  
  const ref = order.external_reference ?? "";
  const enrollmentId = ref.startsWith("enrollment_") ? ref.slice("enrollment_".length) : null;
  const purchaseId = ref.startsWith("purchase_") ? ref.slice("purchase_".length) : null;

  if (enrollmentId) {
    await grantEnrollmentFromPaidOrder(enrollmentId, order.id ?? dataId);
  } else if (purchaseId) {
    await grantPurchaseFromPaidOrder(purchaseId, order.id ?? dataId);
  } else {
    console.warn(`[mp-webhook] order ${dataId} pagada pero con external_reference desconocida: ${order.external_reference}`);
  }

  return NextResponse.json({ received: true });
}
