"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { uploadPublicImage, deletePublicImage, isStorageConfigured } from "@/lib/storage";
import { requireAdmin } from "@/lib/auth-guard";



export async function createFAQ(formData: FormData) {
  await requireAdmin();
  const question = String(formData.get("question") ?? "").trim();
  const answer = String(formData.get("answer") ?? "").trim();
  const section = String(formData.get("section") ?? "general").trim() || "general";
  if (!question || !answer) return;

  const count = await prisma.fAQ.count();
  await prisma.fAQ.create({ data: { question, answer, section, sortOrder: count } });
  revalidatePath("/admin/contenido");
  revalidatePath("/");
}

export async function deleteFAQ(id: string) {
  await requireAdmin();
  await prisma.fAQ.delete({ where: { id } });
  revalidatePath("/admin/contenido");
  revalidatePath("/");
}

export async function toggleFAQPublished(id: string, isPublished: boolean) {
  await requireAdmin();
  await prisma.fAQ.update({ where: { id }, data: { isPublished } });
  revalidatePath("/admin/contenido");
  revalidatePath("/");
}



export async function createTestimonial(formData: FormData) {
  await requireAdmin();
  const customerName = String(formData.get("customerName") ?? "").trim();
  const content = String(formData.get("content") ?? "").trim();
  const ratingRaw = formData.get("rating");
  const isVerified = formData.get("isVerified") === "on";
  if (!customerName || !content) return;

  const count = await prisma.testimonial.count();
  await prisma.testimonial.create({
    data: {
      customerName,
      content,
      rating: ratingRaw ? Number(ratingRaw) : null,
      isVerified,
      isPublished: false,
      sortOrder: count,
    },
  });
  revalidatePath("/admin/contenido");
}

export async function toggleTestimonialPublished(id: string, isPublished: boolean) {
  await requireAdmin();
  await prisma.testimonial.update({ where: { id }, data: { isPublished } });
  revalidatePath("/admin/contenido");
  revalidatePath("/");
}

export async function deleteTestimonial(id: string) {
  await requireAdmin();
  await prisma.testimonial.delete({ where: { id } });
  revalidatePath("/admin/contenido");
  revalidatePath("/");
}



const ALLOWED_IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);
const MAX_IMAGE_BYTES = 8 * 1024 * 1024;

export async function uploadGalleryImage(formData: FormData) {
  await requireAdmin();
  const file = formData.get("file");
  const category = String(formData.get("category") ?? "").trim() || null;
  if (!file || !(file instanceof File)) return;
  if (!ALLOWED_IMAGE_TYPES.has(file.type) || file.size > MAX_IMAGE_BYTES) return;
  if (!isStorageConfigured) return;

  const url = await uploadPublicImage(Buffer.from(await file.arrayBuffer()), "gallery");

  const count = await prisma.galleryImage.count();
  await prisma.galleryImage.create({
    data: { url, category, sortOrder: count },
  });

  revalidatePath("/admin/contenido");
  revalidatePath("/galeria");
  revalidatePath("/");
}

export async function deleteGalleryImage(id: string) {
  await requireAdmin();
  const image = await prisma.galleryImage.findUnique({ where: { id } });
  if (!image) return;
  await prisma.galleryImage.delete({ where: { id } });
  await deletePublicImage(image.url);
  revalidatePath("/admin/contenido");
  revalidatePath("/galeria");
  revalidatePath("/");
}



export async function updateLegalPage(slug: string, formData: FormData) {
  await requireAdmin();
  const title = String(formData.get("title") ?? "").trim();
  const content = String(formData.get("content") ?? "").trim();
  const needsReview = formData.get("needsReview") === "on";
  if (!title || !content) return;

  await prisma.legalPage.update({ where: { slug }, data: { title, content, needsReview } });
  revalidatePath(`/legales/${slug}`);
  revalidatePath("/admin/contenido");
}
