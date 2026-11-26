
import { readFile } from "fs/promises";
import path from "path";
import { prisma } from "@/lib/prisma";
import { uploadPublicImage, isStorageConfigured } from "@/lib/storage";

type Row = Record<string, unknown>;

const uploadedUrls = new Map<string, string>();


async function migrateLocalUrl(url: unknown, folder: string): Promise<unknown> {
  if (typeof url !== "string" || !url.startsWith("/uploads/")) return url;
  const cached = uploadedUrls.get(url);
  if (cached) return cached;

  const buffer = await readFile(path.join(process.cwd(), "public", url)).catch(() => null);
  if (!buffer) {
    console.warn(`  ! no se encontró ${url}, se deja sin imagen`);
    return null;
  }
  const newUrl = await uploadPublicImage(buffer, folder);
  uploadedUrls.set(url, newUrl);
  console.log(`  subida ${url}`);
  return newUrl;
}

async function main() {
  if (!process.env.DATABASE_URL?.startsWith("postgres")) {
    throw new Error("DATABASE_URL no apunta a Postgres. Completá el .env con los datos de Neon.");
  }
  if (!isStorageConfigured) {
    throw new Error("Falta CLOUDINARY_URL en el .env.");
  }

  const file = path.join(process.cwd(), ".data-export", "data.json");
  const data = JSON.parse(await readFile(file, "utf8")) as Record<string, Row[]>;

  for (const img of data.productImage ?? []) img.url = await migrateLocalUrl(img.url, "products");
  for (const img of data.galleryImage ?? []) img.url = await migrateLocalUrl(img.url, "gallery");
  for (const s of data.siteSettings ?? []) s.heroImageUrl = await migrateLocalUrl(s.heroImageUrl, "site");
  for (const c of data.course ?? []) c.coverImageUrl = await migrateLocalUrl(c.coverImageUrl, "courses");
  for (const d of data.digitalProduct ?? []) d.coverImageUrl = await migrateLocalUrl(d.coverImageUrl, "recetarios");

  
  const steps: [string, (rows: Row[]) => Promise<{ count: number }>][] = [
    ["user", (rows) => prisma.user.createMany({ data: rows as never, skipDuplicates: true })],
    ["account", (rows) => prisma.account.createMany({ data: rows as never, skipDuplicates: true })],
    ["category", (rows) => prisma.category.createMany({ data: rows as never, skipDuplicates: true })],
    ["product", (rows) => prisma.product.createMany({ data: rows as never, skipDuplicates: true })],
    ["productImage", (rows) => prisma.productImage.createMany({ data: rows as never, skipDuplicates: true })],
    ["variantGroup", (rows) => prisma.variantGroup.createMany({ data: rows as never, skipDuplicates: true })],
    ["variantOption", (rows) => prisma.variantOption.createMany({ data: rows as never, skipDuplicates: true })],
    ["customOrderRequest", (rows) => prisma.customOrderRequest.createMany({ data: rows as never, skipDuplicates: true })],
    ["orderStatusEvent", (rows) => prisma.orderStatusEvent.createMany({ data: rows as never, skipDuplicates: true })],
    ["eventBudgetRequest", (rows) => prisma.eventBudgetRequest.createMany({ data: rows as never, skipDuplicates: true })],
    ["course", (rows) => prisma.course.createMany({ data: rows as never, skipDuplicates: true })],
    ["courseModule", (rows) => prisma.courseModule.createMany({ data: rows as never, skipDuplicates: true })],
    ["lesson", (rows) => prisma.lesson.createMany({ data: rows as never, skipDuplicates: true })],
    ["courseFAQ", (rows) => prisma.courseFAQ.createMany({ data: rows as never, skipDuplicates: true })],
    ["enrollment", (rows) => prisma.enrollment.createMany({ data: rows as never, skipDuplicates: true })],
    ["digitalProduct", (rows) => prisma.digitalProduct.createMany({ data: rows as never, skipDuplicates: true })],
    ["purchase", (rows) => prisma.purchase.createMany({ data: rows as never, skipDuplicates: true })],
    ["downloadToken", (rows) => prisma.downloadToken.createMany({ data: rows as never, skipDuplicates: true })],
    ["siteSettings", (rows) => prisma.siteSettings.createMany({ data: rows as never, skipDuplicates: true })],
    ["testimonial", (rows) => prisma.testimonial.createMany({ data: rows as never, skipDuplicates: true })],
    ["fAQ", (rows) => prisma.fAQ.createMany({ data: rows as never, skipDuplicates: true })],
    ["galleryImage", (rows) => prisma.galleryImage.createMany({ data: rows as never, skipDuplicates: true })],
    ["legalPage", (rows) => prisma.legalPage.createMany({ data: rows as never, skipDuplicates: true })],
  ];

  for (const [name, insert] of steps) {
    const rows = data[name] ?? [];
    if (rows.length === 0) continue;
    const { count } = await insert(rows);
    console.log(`${name}: ${count} nuevos de ${rows.length}`);
  }

  console.log("\nListo.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
