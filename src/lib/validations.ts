import { z } from "zod";


export function optionalNumber(check: (n: ReturnType<typeof z.coerce.number>) => z.ZodTypeAny) {
  return z.preprocess(
    (val) => (val === "" || val === undefined || val === null ? undefined : val),
    check(z.coerce.number()).optional()
  );
}


export const PRODUCT_TYPES = [
  "FISICO_ENCARGO",
  "FISICO_INMEDIATO",
  "FISICO_ENVIO",
  "BOX",
  "EVENTO",
] as const;

export const AVAILABILITY_STATUSES = [
  "DISPONIBLE_INMEDIATO",
  "DISPONIBLE_ENVIO",
  "POR_ENCARGO",
  "DISPONIBILIDAD_LIMITADA",
  "AGOTADO_TEMPORAL",
  "NO_DISPONIBLE",
] as const;

export const AVAILABILITY_LABELS: Record<(typeof AVAILABILITY_STATUSES)[number], string> = {
  DISPONIBLE_INMEDIATO: "Disponible para entrega inmediata",
  DISPONIBLE_ENVIO: "Disponible para envío",
  POR_ENCARGO: "Se prepara por encargo",
  DISPONIBILIDAD_LIMITADA: "Disponibilidad limitada",
  AGOTADO_TEMPORAL: "Agotado temporalmente",
  NO_DISPONIBLE: "No disponible",
};

export const ORDER_STATUSES = [
  "RECIBIDO",
  "EN_REVISION",
  "PRESUPUESTADO",
  "CONFIRMADO",
  "EN_PREPARACION",
  "LISTO",
  "ENTREGADO",
  "CANCELADO",
] as const;

export const ORDER_STATUS_LABELS: Record<(typeof ORDER_STATUSES)[number], string> = {
  RECIBIDO: "Recibido",
  EN_REVISION: "En revisión",
  PRESUPUESTADO: "Presupuestado",
  CONFIRMADO: "Confirmado",
  EN_PREPARACION: "En preparación",
  LISTO: "Listo",
  ENTREGADO: "Entregado",
  CANCELADO: "Cancelado",
};

export const BUDGET_STATUSES = [
  "RECIBIDO",
  "EN_REVISION",
  "ENVIADO",
  "ACEPTADO",
  "RECHAZADO",
  "VENCIDO",
  "CONVERTIDO",
] as const;

export const BUDGET_STATUS_LABELS: Record<(typeof BUDGET_STATUSES)[number], string> = {
  RECIBIDO: "Recibido",
  EN_REVISION: "En revisión",
  ENVIADO: "Enviado",
  ACEPTADO: "Aceptado",
  RECHAZADO: "Rechazado",
  VENCIDO: "Vencido",
  CONVERTIDO: "Convertido en pedido",
};

export const COURSE_TYPES = ["GRABADO", "VIVO", "TALLER", "INDIVIDUAL"] as const;
export const COURSE_TYPE_LABELS: Record<(typeof COURSE_TYPES)[number], string> = {
  GRABADO: "Curso grabado",
  VIVO: "Clase en vivo",
  TALLER: "Taller puntual",
  INDIVIDUAL: "Clase individual",
};

export const ENROLLMENT_STATUSES = ["PENDIENTE_PAGO", "ACTIVA", "REVOCADA"] as const;
export const PURCHASE_STATUSES = ["PENDIENTE_PAGO", "PAGADO", "CANCELADO"] as const;

export const CATEGORY_KINDS = ["TORTA", "PASTELERIA", "BOX", "EVENTO", "DIGITAL", "CURSO"] as const;





export const customOrderRequestSchema = z.object({
  formToken: z.string().uuid(),
  productId: z.string().optional().nullable(),
  customerName: z.string().trim().min(2, "Ingresá tu nombre y apellido"),
  customerPhone: z
    .string()
    .trim()
    .min(8, "Ingresá un WhatsApp válido")
    .max(20),
  customerEmail: z.string().trim().email("El correo no es válido").optional().or(z.literal("")),
  eventDate: z.string().optional().or(z.literal("")),
  servingsOrQty: z.string().trim().max(200).optional().or(z.literal("")),
  flavorFilling: z.string().trim().max(300).optional().or(z.literal("")),
  theme: z.string().trim().max(300).optional().or(z.literal("")),
  colors: z.string().trim().max(200).optional().or(z.literal("")),
  dedication: z.string().trim().max(300).optional().or(z.literal("")),
  deliveryMethod: z.enum(["retiro", "envio"]).optional().or(z.literal("")),
  estimatedBudget: optionalNumber((n) => n.positive()),
  notes: z.string().trim().max(2000).optional().or(z.literal("")),
  referenceImageUrl: z.string().trim().max(500).optional().or(z.literal("")),
});

export type CustomOrderRequestInput = z.infer<typeof customOrderRequestSchema>;

export const eventBudgetRequestSchema = z.object({
  formToken: z.string().uuid(),
  customerName: z.string().trim().min(2, "Ingresá tu nombre y apellido"),
  customerPhone: z.string().trim().min(8, "Ingresá un WhatsApp válido").max(20),
  customerEmail: z.string().trim().email("El correo no es válido").optional().or(z.literal("")),
  eventType: z.string().trim().min(2, "Contanos qué tipo de evento es"),
  eventDate: z.string().optional().or(z.literal("")),
  guestCount: optionalNumber((n) => n.int().positive()),
  location: z.string().trim().max(300).optional().or(z.literal("")),
  productsOfInterest: z.string().trim().max(500).optional().or(z.literal("")),
  estimatedBudget: optionalNumber((n) => n.positive()),
  notes: z.string().trim().max(2000).optional().or(z.literal("")),
});

export type EventBudgetRequestInput = z.infer<typeof eventBudgetRequestSchema>;
