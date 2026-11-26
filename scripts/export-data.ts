
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { prisma } from "@/lib/prisma";

async function main() {
  const data = {
    exportedAt: new Date().toISOString(),
    user: await prisma.user.findMany(),
    account: await prisma.account.findMany(),
    category: await prisma.category.findMany(),
    product: await prisma.product.findMany(),
    productImage: await prisma.productImage.findMany(),
    variantGroup: await prisma.variantGroup.findMany(),
    variantOption: await prisma.variantOption.findMany(),
    customOrderRequest: await prisma.customOrderRequest.findMany(),
    orderStatusEvent: await prisma.orderStatusEvent.findMany(),
    eventBudgetRequest: await prisma.eventBudgetRequest.findMany(),
    course: await prisma.course.findMany(),
    courseModule: await prisma.courseModule.findMany(),
    lesson: await prisma.lesson.findMany(),
    courseFAQ: await prisma.courseFAQ.findMany(),
    enrollment: await prisma.enrollment.findMany(),
    digitalProduct: await prisma.digitalProduct.findMany(),
    purchase: await prisma.purchase.findMany(),
    downloadToken: await prisma.downloadToken.findMany(),
    siteSettings: await prisma.siteSettings.findMany(),
    testimonial: await prisma.testimonial.findMany(),
    fAQ: await prisma.fAQ.findMany(),
    galleryImage: await prisma.galleryImage.findMany(),
    legalPage: await prisma.legalPage.findMany(),
  };

  const dir = path.join(process.cwd(), ".data-export");
  await mkdir(dir, { recursive: true });
  const file = path.join(dir, "data.json");
  await writeFile(file, JSON.stringify(data, null, 2));

  for (const [key, value] of Object.entries(data)) {
    if (Array.isArray(value)) console.log(`${key}: ${value.length}`);
  }
  console.log(`\nExportado a ${file}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
