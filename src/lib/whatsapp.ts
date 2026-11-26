

export function buildWhatsAppUrl(phoneNumber: string | null | undefined, message: string): string | null {
  if (!phoneNumber || phoneNumber.trim() === "") return null;
  const cleanNumber = phoneNumber.replace(/[^0-9]/g, "");
  if (cleanNumber.length < 8) return null;
  return `https://wa.me/${cleanNumber}?text=${encodeURIComponent(message)}`;
}

function joinLines(lines: Array<string | null | undefined | false>): string {
  
  
  
  
  return lines
    .filter((line): line is string => line !== null && line !== undefined && line !== false)
    .join("\n")
    .replace(/\n{3,}/g, "\n\n");
}

export function buildProductAvailabilityMessage(params: {
  productName: string;
  quantity?: string | number | null;
  price?: string | null;
  modality?: string | null;
  productUrl?: string | null;
}): string {
  const { productName, quantity, price, modality, productUrl } = params;
  return joinLines([
    "¡Hola, Celeste! Vi este producto en tu página web y quisiera consultar por su disponibilidad.",
    "",
    `Producto: ${productName}`,
    quantity ? `Cantidad: ${quantity}` : null,
    price ? `Precio publicado: ${price}` : null,
    modality ? `Modalidad: ${modality}` : null,
    productUrl ? `Enlace: ${productUrl}` : null,
    "",
    "¿Me podrías confirmar si está disponible y cómo podemos coordinar? ¡Gracias!",
  ]);
}

export function buildCustomCakeMessage(params: {
  productName?: string | null;
  servingsOrQty?: string | null;
  flavorFilling?: string | null;
  theme?: string | null;
  eventDate?: string | null;
  quantity?: string | number | null;
  notes?: string | null;
  prepTimeNote?: string | null;
  productUrl?: string | null;
}): string {
  const { productName, servingsOrQty, flavorFilling, theme, eventDate, quantity, notes, prepTimeNote, productUrl } = params;
  return joinLines([
    "¡Hola, Celeste! Quisiera consultar por una torta personalizada.",
    "",
    productName ? `Tipo de torta: ${productName}` : null,
    servingsOrQty ? `Tamaño o porciones: ${servingsOrQty}` : null,
    flavorFilling ? `Sabor y relleno: ${flavorFilling}` : null,
    theme ? `Temática: ${theme}` : null,
    eventDate ? `Fecha deseada: ${eventDate}` : null,
    quantity ? `Cantidad: ${quantity}` : null,
    notes ? `Detalles adicionales: ${notes}` : null,
    productUrl ? `Enlace: ${productUrl}` : null,
    "",
    prepTimeNote ? `Vi en tu web que el tiempo aproximado de preparación es de ${prepTimeNote}.` : null,
    "",
    "¿Me podrías confirmar la disponibilidad y pasarme un presupuesto? ¡Gracias!",
  ]);
}

export function buildEventMessage(params: {
  eventType?: string | null;
  eventDate?: string | null;
  guestCount?: string | number | null;
  productsOfInterest?: string | null;
  location?: string | null;
  notes?: string | null;
}): string {
  const { eventType, eventDate, guestCount, productsOfInterest, location, notes } = params;
  return joinLines([
    "¡Hola, Celeste! Quisiera consultar por una propuesta de pastelería para un evento.",
    "",
    eventType ? `Tipo de evento: ${eventType}` : null,
    eventDate ? `Fecha: ${eventDate}` : null,
    guestCount ? `Cantidad estimada de invitados: ${guestCount}` : null,
    productsOfInterest ? `Productos de interés: ${productsOfInterest}` : null,
    location ? `Lugar o localidad: ${location}` : null,
    notes ? `Detalles adicionales: ${notes}` : null,
    "",
    "¿Podrías asesorarme y pasarme un presupuesto?",
  ]);
}

export function buildDigitalProductMessage(params: {
  kind: "curso" | "recetario";
  title: string;
  price?: string | null;
  productUrl?: string | null;
}): string {
  const { kind, title, price, productUrl } = params;
  const label = kind === "curso" ? "este curso online" : "este recetario digital";
  return joinLines([
    `¡Hola, Celeste! Quiero comprar ${label}.`,
    "",
    `${kind === "curso" ? "Curso" : "Recetario"}: ${title}`,
    price ? `Precio publicado: ${price}` : null,
    productUrl ? `Enlace: ${productUrl}` : null,
    "",
    "¿Me contás cómo coordinamos el pago y el acceso? ¡Gracias!",
  ]);
}

export function buildBoxMessage(params: {
  productName: string;
  variant?: string | null;
  dedication?: string | null;
  deliveryDate?: string | null;
  quantity?: string | number | null;
  productUrl?: string | null;
}): string {
  const { productName, variant, dedication, deliveryDate, quantity, productUrl } = params;
  return joinLines([
    "¡Hola, Celeste! Quisiera consultar por un box para regalar.",
    "",
    `Box: ${productName}`,
    variant ? `Variante: ${variant}` : null,
    quantity ? `Cantidad: ${quantity}` : null,
    deliveryDate ? `Fecha deseada: ${deliveryDate}` : null,
    dedication ? `Dedicatoria: ${dedication}` : null,
    productUrl ? `Enlace: ${productUrl}` : null,
    "",
    "¿Me podrías confirmar disponibilidad y precio? ¡Gracias!",
  ]);
}
