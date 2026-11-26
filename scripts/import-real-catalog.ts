
import { prisma } from "@/lib/prisma";

const PICKUP_INSTRUCTIONS =
  "Si retirás vos el pedido: transportalo sobre una superficie plana y estable, evitá llevarlo sobre los asientos y conducí con cuidado, a velocidad moderada, evitando frenadas bruscas. Mantené el vehículo fresco.";
const SHIPPING_NOTE =
  "Hay servicio de traslado y armado en el lugar del evento, sujeto a disponibilidad y con costo adicional a consultar.";

type SizeTier = { label: string; price: number };

const TIER_A: SizeTier[] = [
  { label: "20cm — 10 porciones", price: 25000 },
  { label: "22cm — 12 porciones", price: 29000 },
  { label: "24cm — 14/16 porciones", price: 34000 },
  { label: "26cm — 18 porciones", price: 40000 },
];

const TIER_A2: SizeTier[] = [
  { label: "20cm — 10 porciones", price: 22000 },
  { label: "22cm — 12 porciones", price: 26000 },
  { label: "24cm — 14/16 porciones", price: 30000 },
  { label: "26cm — 18 porciones", price: 35000 },
];

const TIER_B: SizeTier[] = [
  { label: "20cm — 10 porciones", price: 28000 },
  { label: "22cm — 12 porciones", price: 40000 },
  { label: "24cm — 14/16 porciones", price: 62000 },
  { label: "26cm — 18 porciones", price: 75000 },
];

type TortaDef = {
  slug: string;
  name: string;
  description: string;
  tier: SizeTier[];
  flavors?: string[];
  isFeatured?: boolean;
};

const TORTAS: TortaDef[] = [
  { slug: "torta-key-lime-pie", name: "Key Lime Pie (Tarta de lima)", description: "Tarta de lima con base crocante y cobertura cítrica.", tier: TIER_A },
  {
    slug: "torta-cheesecake",
    name: "Cheesecake",
    description: "Cheesecake horneado, a elección entre frutos rojos, chocolate o maracuyá.",
    tier: TIER_B,
    flavors: ["Frutos rojos", "Chocolate", "Maracuyá"],
    isFeatured: true,
  },
  {
    slug: "torta-brownie",
    name: "Torta brownie",
    description: "Torta de brownie con decoración a elección.",
    tier: TIER_B,
    flavors: ["Clásico", "Frutas", "Ganache", "Oreo", "Nuez"],
  },
  { slug: "torta-banana-split", name: "Banana Split", description: "Dulce de leche, crema, bananas y nuez.", tier: TIER_A2 },
  { slug: "torta-rogel", name: "Rogel", description: "Capas de masa crocante con dulce de leche y merengue.", tier: TIER_B },
  { slug: "torta-cabsha", name: "Tarta Cabsha", description: "Tarta cabsha clásica.", tier: TIER_A2 },
  { slug: "torta-lemon-pie", name: "Lemon Pie", description: "Crema de limón y merengue.", tier: TIER_A2 },
  { slug: "torta-pavlova", name: "Pavlova", description: "Merengue, dulce de leche, crema y frutas de estación.", tier: TIER_A },
  { slug: "torta-de-nuez", name: "Torta de nuez", description: "Base de nuez, dulce de leche, crema y frutas de estación.", tier: TIER_A },
  { slug: "torta-frutal", name: "Torta frutal", description: "Chantilly o crema pastelera con frutas de estación.", tier: TIER_A2 },
  { slug: "torta-matilda", name: "Torta Matilda", description: "Dulce de leche y ganache de chocolate.", tier: TIER_B },
  { slug: "torta-franui", name: "Torta Franuí", description: "Dulce de leche, ganache de chocolate y frambuesas.", tier: TIER_B },
  { slug: "torta-carrot-cake", name: "Carrot Cake", description: "Bizcochuelo de zanahoria con crema de queso y nueces.", tier: TIER_B },
  { slug: "torta-red-velvet", name: "Red Velvet", description: "Bizcochuelo suave con crema de queso.", tier: TIER_B, isFeatured: true },
  { slug: "torta-chaja", name: "Chajá", description: "Crema con duraznos, dulce de leche y merengue.", tier: TIER_B },
];

async function upsertProduct(categoryId: string, data: Record<string, unknown> & { slug: string }) {
  const existing = await prisma.product.findUnique({ where: { slug: data.slug } });
  const product = await prisma.product.upsert({
    where: { slug: data.slug },
    update: { ...data, categoryId, isDemo: false },
    create: { ...data, categoryId, isDemo: false } as never,
  });
  if (existing) {
    
    
    
    await prisma.variantGroup.deleteMany({ where: { productId: product.id } });
  }
  return product;
}

async function addSizeAndFlavorVariants(productId: string, tier: SizeTier[], flavors?: string[]) {
  const basePrice = tier[0].price;
  const sizeGroup = await prisma.variantGroup.create({
    data: { productId, name: "Tamaño", required: true, sortOrder: 0 },
  });
  for (const [i, t] of tier.entries()) {
    await prisma.variantOption.create({
      data: { variantGroupId: sizeGroup.id, label: t.label, priceModifier: t.price - basePrice, sortOrder: i },
    });
  }

  if (flavors?.length) {
    const flavorGroup = await prisma.variantGroup.create({
      data: { productId, name: "Sabor", required: true, sortOrder: 1 },
    });
    for (const [i, f] of flavors.entries()) {
      await prisma.variantOption.create({ data: { variantGroupId: flavorGroup.id, label: f, sortOrder: i } });
    }
  }
}

async function main() {
  const tortaCat = await prisma.category.findUniqueOrThrow({ where: { slug: "tortas-personalizadas" } });
  const pasteleriaCat = await prisma.category.findUniqueOrThrow({ where: { slug: "pasteleria-y-dulces" } });
  const boxCat = await prisma.category.findUniqueOrThrow({ where: { slug: "boxes" } });
  const eventoCat = await prisma.category.findUniqueOrThrow({ where: { slug: "eventos" } });

  
  for (const t of TORTAS) {
    const product = await upsertProduct(tortaCat.id, {
      slug: t.slug,
      name: t.name,
      shortDescription: t.description,
      description: `${t.description} Tortas 100% artesanales, cubiertas con buttercream (crema de manteca) cuando corresponde.`,
      productType: "FISICO_ENCARGO",
      availabilityStatus: "POR_ENCARGO",
      price: t.tier[0].price,
      priceNote: "desde — precio final según tamaño elegido",
      requiresQuote: false,
      servings: "10 a 18 porciones según tamaño",
      customizable: true,
      allowPickup: true,
      allowShipping: true,
      shippingNotes: SHIPPING_NOTE,
      customerInstructions: PICKUP_INSTRUCTIONS,
      isFeatured: Boolean(t.isFeatured),
      isPublished: true,
    });
    await addSizeAndFlavorVariants(product.id, t.tier, t.flavors);
  }

  
  for (const t of [
    { slug: "torta-oreo", name: "Torta Oreo", description: "Dulce de leche, crema y oreos. Decoración a elección." },
    { slug: "torta-chocolina", name: "Chocolina", description: "Torta Chocolina clásica." },
  ]) {
    await upsertProduct(tortaCat.id, {
      slug: t.slug,
      name: t.name,
      shortDescription: t.description,
      description: `${t.description} Se cotiza por kilo.`,
      productType: "FISICO_ENCARGO",
      availabilityStatus: "POR_ENCARGO",
      price: 25000,
      priceNote: "por kg",
      servings: "a definir según kg",
      customizable: true,
      allowPickup: true,
      allowShipping: true,
      shippingNotes: SHIPPING_NOTE,
      customerInstructions: PICKUP_INSTRUCTIONS,
      isPublished: true,
    });
  }

  
  const cumple = await upsertProduct(tortaCat.id, {
    slug: "torta-tematica-por-encargo",
    name: "Torta de cumpleaños personalizada",
    shortDescription: "Torta decorada con buttercream, diseño a elección, para 15 a 35+ invitados.",
    description:
      "Torta de cumpleaños 100% artesanal, cubierta con buttercream (crema de manteca), con el diseño que seas quieras. El precio final depende del diseño elegido. Podés agregar pisos falsos de tergopol (para fotos) por un valor aproximado de $20.000, según el diseño.",
    productType: "FISICO_ENCARGO",
    availabilityStatus: "POR_ENCARGO",
    price: 40000,
    priceNote: "aprox. desde, según diseño y cantidad de invitados — consultar para más personas",
    requiresQuote: true,
    servings: "15 a 35+ invitados",
    customizable: true,
    allowPickup: true,
    allowShipping: true,
    shippingNotes: SHIPPING_NOTE,
    customerInstructions: PICKUP_INSTRUCTIONS,
    isFeatured: true,
    isPublished: true,
  });
  const invitadosGroup = await prisma.variantGroup.create({ data: { productId: cumple.id, name: "Cantidad de invitados", required: true, sortOrder: 0 } });
  for (const [i, o] of [
    { label: "15 personas", price: 40000 },
    { label: "20/25 personas", price: 48000 },
    { label: "30/35 personas", price: 70000 },
    { label: "Más de 35 personas (consultar)", price: 70000 },
  ].entries()) {
    await prisma.variantOption.create({ data: { variantGroupId: invitadosGroup.id, label: o.label, priceModifier: o.price - 40000, sortOrder: i } });
  }
  const rellenoGroup = await prisma.variantGroup.create({ data: { productId: cumple.id, name: "Relleno", required: true, sortOrder: 1 } });
  for (const [i, r] of ["Dulce de leche", "Dulce de leche con oreos", "Dulce de leche con merengue", "Dulce de leche con chocolate blanco"].entries()) {
    await prisma.variantOption.create({ data: { variantGroupId: rellenoGroup.id, label: r, sortOrder: i } });
  }

  
  const combos = [
    { slug: "combo-cumple-1", name: "Combo Cumple 1", price: 60000, items: "Torta 15 porciones (diseño a elección), 10 conitos con dulce de leche, 10 shots y 10 alfajores de maicena.", featured: true },
    { slug: "combo-cumple-2", name: "Combo Cumple 2", price: 55000, items: "Torta 15 porciones (diseño a elección), 10 alfajores cookies, 10 conitos y 10 alfajores de maicena." },
    { slug: "combo-cumple-3", name: "Combo Cumple 3", price: 50000, items: "Torta 15 porciones (diseño a elección), 10 oreos con chocolate, 10 conitos y 10 alfajores de maicena." },
  ];
  for (const c of combos) {
    await upsertProduct(tortaCat.id, {
      slug: c.slug,
      name: c.name,
      shortDescription: c.items,
      description: `Incluye: ${c.items} Rellenos a elección: dulce de leche, dulce de leche con oreos, dulce de leche con merengue o dulce de leche con chocolate blanco.`,
      productType: "FISICO_ENCARGO",
      availabilityStatus: "POR_ENCARGO",
      price: c.price,
      customizable: true,
      servings: "15 porciones de torta + bocaditos",
      allowPickup: true,
      allowShipping: true,
      shippingNotes: SHIPPING_NOTE,
      customerInstructions: PICKUP_INSTRUCTIONS,
      isFeatured: Boolean(c.featured),
      isPublished: true,
    });
  }

  
  const miniCakes = await upsertProduct(pasteleriaCat.id, {
    slug: "docena-mini-cakes-picoteo",
    name: "Docena de mini cakes y picoteo",
    shortDescription: "Armá tu docena eligiendo entre brownie, alfajores, tartas frutales, cake pops y más.",
    description:
      "A partir de una docena podés elegir cualquier variedad (o combinarlas) entre: brownie, bombas de crema, alfajores marplatense, tartas frutales, lemon pie, cake pop, conitos, oreos, trufas, alfajores cookies, alfajores oreos, rogelitos y muffins. Armalo como más te guste.",
    productType: "FISICO_ENCARGO",
    availabilityStatus: "POR_ENCARGO",
    price: 10000,
    priceNote: "la docena — si es personalizado, el precio final depende del diseño",
    customizable: true,
    servings: "12 unidades",
    allowPickup: true,
    customerInstructions: PICKUP_INSTRUCTIONS,
    isPublished: true,
  });
  const variedadGroup = await prisma.variantGroup.create({ data: { productId: miniCakes.id, name: "Variedad", required: false, sortOrder: 0 } });
  for (const [i, v] of [
    "Brownie", "Bombas de crema", "Alfajores marplatense", "Tartas frutales", "Lemon pie", "Cake pop",
    "Conitos", "Oreos", "Trufas", "Alfajores cookies", "Alfajores oreos", "Rogelitos", "Muffins",
  ].entries()) {
    await prisma.variantOption.create({ data: { variantGroupId: variedadGroup.id, label: v, sortOrder: i } });
  }

  
  const petitFour = await upsertProduct(eventoCat.id, {
    slug: "docena-de-petit-fours",
    name: "Bandeja de Petit Four",
    shortDescription: "Bandeja de petit four para mesas dulces y eventos.",
    description: "Bandeja de petit four surtidos, ideal para mesas dulces y eventos.",
    productType: "EVENTO",
    availabilityStatus: "POR_ENCARGO",
    price: 18000,
    priceNote: null,
    servings: "16 unidades",
    allowPickup: true,
    allowShipping: true,
    shippingNotes: SHIPPING_NOTE,
    isFeatured: true,
    isPublished: true,
  });
  const cantidadPFGroup = await prisma.variantGroup.create({ data: { productId: petitFour.id, name: "Cantidad", required: true, sortOrder: 0 } });
  for (const [i, o] of [
    { label: "16 unidades", price: 18000 },
    { label: "25 unidades", price: 28000 },
  ].entries()) {
    await prisma.variantOption.create({ data: { variantGroupId: cantidadPFGroup.id, label: o.label, priceModifier: o.price - 18000, sortOrder: i } });
  }

  const shots = await upsertProduct(eventoCat.id, {
    slug: "shots-individuales-docena",
    name: "Shots individuales (docena)",
    shortDescription: "Postres individuales en vaso, por docena, para mesas dulces.",
    description: "Shots de postre individuales para mesas dulces y eventos, en vaso descartable o de acrílico.",
    productType: "EVENTO",
    availabilityStatus: "POR_ENCARGO",
    price: 1700,
    priceNote: "la docena",
    servings: "12 unidades",
    allowPickup: true,
    allowShipping: true,
    shippingNotes: SHIPPING_NOTE,
    isPublished: true,
  });
  const vasoGroup = await prisma.variantGroup.create({ data: { productId: shots.id, name: "Tipo de vaso", required: true, sortOrder: 0 } });
  for (const [i, o] of [
    { label: "Descartable", price: 1700 },
    { label: "Acrílico", price: 2200 },
  ].entries()) {
    await prisma.variantOption.create({ data: { variantGroupId: vasoGroup.id, label: o.label, priceModifier: o.price - 1700, sortOrder: i } });
  }

  await upsertProduct(eventoCat.id, {
    slug: "mesa-dulce-para-eventos",
    name: "Bandeja de Postres",
    shortDescription: "Bandeja de postres variados para eventos.",
    description: "Bandeja de postres surtidos para mesas dulces y eventos.",
    productType: "EVENTO",
    availabilityStatus: "POR_ENCARGO",
    price: 38000,
    servings: "16 unidades",
    allowPickup: true,
    allowShipping: true,
    shippingNotes: SHIPPING_NOTE,
    isFeatured: true,
    isPublished: true,
  });

  
  await upsertProduct(boxCat.id, {
    slug: "box-dulce-para-regalar",
    name: "Caja Matera",
    shortDescription: "Caja dulce para compartir, pensada para el mate.",
    description: "Caja matera con surtido dulce, pensada para compartir. El precio depende de la cantidad de personas.",
    productType: "BOX",
    availabilityStatus: "POR_ENCARGO",
    price: 9000,
    priceNote: "desde, según cantidad de personas — consultar por más cantidad",
    requiresQuote: true,
    customizable: true,
    allowPickup: true,
    isFeatured: true,
    isPublished: true,
  });

  await upsertProduct(boxCat.id, {
    slug: "cookies-individuales",
    name: "Cookies",
    shortDescription: "Cookies individuales, también por docena.",
    description: "Cookies individuales. Para eventos se pueden hacer de un tamaño más chico. Consultar variedades disponibles.",
    productType: "BOX",
    availabilityStatus: "POR_ENCARGO",
    price: 3000,
    priceNote: "la unidad — docena tamaño evento $9.500",
    allowPickup: true,
    isPublished: true,
  });

  const budin = await upsertProduct(boxCat.id, {
    slug: "budin-casero",
    name: "Budín",
    shortDescription: "Budín casero en 3 tamaños y 5 sabores.",
    description: "Budín casero artesanal.",
    productType: "BOX",
    availabilityStatus: "POR_ENCARGO",
    price: 4000,
    priceNote: "según tamaño elegido",
    allowPickup: true,
    isPublished: true,
  });
  const tamanoBudinGroup = await prisma.variantGroup.create({ data: { productId: budin.id, name: "Tamaño", required: true, sortOrder: 0 } });
  for (const [i, o] of [
    { label: "200gr", price: 4000 },
    { label: "500gr", price: 8000 },
    { label: "1kg", price: 16000 },
  ].entries()) {
    await prisma.variantOption.create({ data: { variantGroupId: tamanoBudinGroup.id, label: o.label, priceModifier: o.price - 4000, sortOrder: i } });
  }
  const saborBudinGroup = await prisma.variantGroup.create({ data: { productId: budin.id, name: "Sabor", required: true, sortOrder: 1 } });
  for (const [i, s] of ["Matilda", "Vainilla con chips", "Limón", "Frutos rojos", "Frutos secos"].entries()) {
    await prisma.variantOption.create({ data: { variantGroupId: saborBudinGroup.id, label: s, sortOrder: i } });
  }

  console.log("Catálogo real importado correctamente.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
