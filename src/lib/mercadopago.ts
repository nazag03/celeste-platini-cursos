import { MercadoPagoConfig, Order } from "mercadopago";


export const isMercadoPagoConfigured = Boolean(process.env.MP_ACCESS_TOKEN);

let orderClient: Order | null = null;


export function getOrderClient(): Order {
  if (!process.env.MP_ACCESS_TOKEN) {
    throw new Error("MP_ACCESS_TOKEN no está configurado.");
  }
  if (!orderClient) {
    const config = new MercadoPagoConfig({ accessToken: process.env.MP_ACCESS_TOKEN });
    orderClient = new Order(config);
  }
  return orderClient;
}


export function isOrderPaid(order: { status?: string; status_detail?: string }): boolean {
  return order.status === "processed" && order.status_detail === "accredited";
}
