
import { prisma } from "@/lib/prisma";

async function main() {
  await prisma.siteSettings.upsert({
    where: { id: "default" },
    update: {},
    create: {
      id: "default",
      brandName: "Celeste Platini Pastelería",
      instagramUrl: "https://www.instagram.com/celesteplatinipasteleria/",
      location: "San Francisco, Córdoba",
      announcementText: "Pedidos abiertos — escribinos por WhatsApp para coordinar tu torta.",
      announcementIsActive: false,
      deliveryPickupEnabled: true,
      deliveryShippingEnabled: false,
      paymentMethodsNote: "Medios de pago a coordinar por WhatsApp (transferencia, efectivo u otro acuerdo).",
      heroTitle: "Tortas y dulces hechos con el mismo cuidado de siempre",
      heroSubtitle:
        "Pastelería artesanal, eventos y clases online desde San Francisco, Córdoba.",
    },
  });

  const categories = [
    { slug: "tortas-personalizadas", name: "Tortas personalizadas", kind: "TORTA", sortOrder: 1 },
    { slug: "pasteleria-y-dulces", name: "Pastelería y dulces", kind: "PASTELERIA", sortOrder: 2 },
    { slug: "boxes", name: "Boxes para regalar", kind: "BOX", sortOrder: 3 },
    { slug: "eventos", name: "Eventos y mesas dulces", kind: "EVENTO", sortOrder: 4 },
  ];

  for (const c of categories) {
    await prisma.category.upsert({
      where: { slug: c.slug },
      update: { name: c.name, kind: c.kind, sortOrder: c.sortOrder },
      create: c,
    });
  }

  const tortas = await prisma.category.findUniqueOrThrow({ where: { slug: "tortas-personalizadas" } });
  const pasteleria = await prisma.category.findUniqueOrThrow({ where: { slug: "pasteleria-y-dulces" } });
  const boxes = await prisma.category.findUniqueOrThrow({ where: { slug: "boxes" } });
  const eventos = await prisma.category.findUniqueOrThrow({ where: { slug: "eventos" } });

  const demoProducts = [
    {
      slug: "torta-tematica-por-encargo",
      name: "Torta temática por encargo",
      shortDescription: "Torta decorada a medida, diseño a coordinar.",
      description:
        "Ejemplo de producto de demostración: torta personalizada con diseño, colores y temática a definir junto a Celeste. Reemplazar por los productos reales del catálogo.",
      categoryId: tortas.id,
      productType: "FISICO_ENCARGO",
      availabilityStatus: "POR_ENCARGO",
      requiresQuote: true,
      prepTimeDays: 3,
      minAdvanceDays: 5,
      requiresDeposit: true,
      servings: "20 a 25 porciones (orientativo)",
      customizable: true,
      isFeatured: true,
      isDemo: true,
    },
    {
      slug: "docena-de-petit-fours",
      name: "Docena de petit fours",
      shortDescription: "Surtido de petit fours listo para retirar.",
      description:
        "Ejemplo de producto de demostración de entrega inmediata. Reemplazar por el producto real, fotos y precio definitivo.",
      categoryId: pasteleria.id,
      productType: "FISICO_INMEDIATO",
      availabilityStatus: "DISPONIBLE_INMEDIATO",
      price: 12000,
      priceNote: "Precio de ejemplo — actualizar desde el panel",
      stockQuantity: 6,
      allowPickup: true,
      servings: "12 unidades",
      isFeatured: true,
      isDemo: true,
    },
    {
      slug: "box-dulce-para-regalar",
      name: "Box dulce para regalar",
      shortDescription: "Caja de regalo con surtido de dulces y dedicatoria opcional.",
      description:
        "Ejemplo de box de demostración. La composición real, fotos y precio deben cargarse desde el panel antes de publicar.",
      categoryId: boxes.id,
      productType: "BOX",
      availabilityStatus: "POR_ENCARGO",
      prepTimeDays: 1,
      minAdvanceDays: 1,
      customizable: true,
      isFeatured: true,
      isDemo: true,
    },
    {
      slug: "mesa-dulce-para-eventos",
      name: "Mesa dulce para eventos",
      shortDescription: "Propuesta de mesa dulce personalizable según el evento.",
      description:
        "Ejemplo de producto de demostración para la sección de eventos. Los servicios reales que ofrece Celeste deben cargarse desde el panel.",
      categoryId: eventos.id,
      productType: "EVENTO",
      availabilityStatus: "POR_ENCARGO",
      requiresQuote: true,
      minAdvanceDays: 10,
      customizable: true,
      isFeatured: false,
      isDemo: true,
    },
  ];

  for (const p of demoProducts) {
    await prisma.product.upsert({
      where: { slug: p.slug },
      update: p,
      create: p,
    });
  }

  const faqs = [
    {
      question: "¿Con cuánta anticipación tengo que pedir mi torta?",
      answer:
        "Depende del producto: cada ficha muestra el tiempo aproximado de preparación y la anticipación mínima recomendada. Como referencia general, para tortas personalizadas se recomienda coordinar con varios días de anticipación.",
      section: "pedidos",
      sortOrder: 1,
    },
    {
      question: "¿Cómo pago mi pedido?",
      answer:
        "Los pedidos se coordinan y confirman por WhatsApp. Ahí te va a contar qué medios de pago tiene disponibles.",
      section: "pedidos",
      sortOrder: 2,
    },
    {
      question: "¿Puedo retirar mi pedido o hacen envíos?",
      answer:
        "Las modalidades disponibles (retiro, envío) se indican en cada producto y se confirman al coordinar por WhatsApp.",
      section: "pedidos",
      sortOrder: 3,
    },
    {
      question: "¿Cómo accedo a un curso online después de comprarlo?",
      answer:
        "Una vez coordinado el pago por WhatsApp, vas a recibir acceso a tu cuenta para ver las clases y materiales del curso.",
      section: "cursos",
      sortOrder: 4,
    },
    {
      question: "¿Cómo descargo un recetario digital?",
      answer:
        "Después de confirmar el pago por WhatsApp, el acceso para descargar el recetario se habilita desde tu cuenta.",
      section: "recetarios",
      sortOrder: 5,
    },
  ];

  for (const f of faqs) {
    const existing = await prisma.fAQ.findFirst({ where: { question: f.question } });
    if (!existing) {
      await prisma.fAQ.create({ data: f });
    }
  }

  const legalPages = [
    {
      slug: "terminos",
      title: "Términos y condiciones",
      content:
        "Contenido pendiente de redacción definitiva. Este texto debe adaptarse a las operaciones reales del negocio y, antes de publicarse, revisarse con un profesional. No reemplaza asesoramiento legal.",
    },
    {
      slug: "privacidad",
      title: "Política de privacidad",
      content:
        "Contenido pendiente de redacción definitiva. Describir qué datos personales se recolectan (nombre, WhatsApp, email), con qué fin se usan y cómo se resguardan. Revisar con un profesional antes de publicar.",
    },
    {
      slug: "cookies",
      title: "Política de cookies",
      content: "Contenido pendiente de redacción definitiva, según las tecnologías de seguimiento que efectivamente se usen en el sitio.",
    },
    {
      slug: "cancelaciones",
      title: "Política de cancelaciones y devoluciones",
      content:
        "Contenido pendiente: definir junto a Celeste las condiciones reales de cancelación, devolución de señas y reprogramación de pedidos.",
    },
    {
      slug: "envios",
      title: "Política de envíos y retiros",
      content:
        "Contenido pendiente: definir zonas de envío, costos, horarios de retiro y condiciones según la operación real del negocio.",
    },
  ];

  for (const page of legalPages) {
    await prisma.legalPage.upsert({
      where: { slug: page.slug },
      update: {},
      create: page,
    });
  }

  console.log("Seed de demostración cargado correctamente.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
