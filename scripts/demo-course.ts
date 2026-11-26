
import { prisma } from "@/lib/prisma";

const SLUG = "demo-pago-online";

async function main() {
  const action = process.argv[2];

  if (action === "delete") {
    const course = await prisma.course.findUnique({ where: { slug: SLUG } });
    if (!course) return console.log("No existe el curso demo.");
    await prisma.enrollment.deleteMany({ where: { courseId: course.id } });
    await prisma.course.delete({ where: { id: course.id } });
    return console.log("Curso demo borrado (con sus inscripciones).");
  }

  if (action === "reset") {
    
    const course = await prisma.course.findUnique({ where: { slug: SLUG } });
    if (!course) return console.log("No existe el curso demo.");
    const { count } = await prisma.enrollment.deleteMany({ where: { courseId: course.id } });
    return console.log(`Curso demo reseteado (${count} inscripciones borradas).`);
  }

  if (action !== "create") throw new Error('Usar "create", "reset" o "delete".');

  const cover = await prisma.productImage.findFirst({ orderBy: { sortOrder: "asc" } });

  const course = await prisma.course.upsert({
    where: { slug: SLUG },
    update: {},
    create: {
      slug: SLUG,
      title: "Curso de prueba (demo de pago online)",
      summary: "Curso de demostración para mostrar cómo funciona la compra online.",
      description:
        "Este es un curso de prueba para mostrar el circuito de compra: pagás con Mercado Pago, recibís un mail con el acceso y el curso aparece desbloqueado en tu cuenta.",
      courseType: "GRABADO",
      modality: "Online, a tu ritmo",
      price: 1000,
      coverImageUrl: cover?.url ?? null,
      isPublished: true,
      isFeatured: true,
    },
  });
  console.log(`Curso demo listo: /cursos-online/${course.slug}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
