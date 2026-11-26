"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-guard";
import { COURSE_TYPES } from "@/lib/validations";
import { accessPageUrl } from "@/lib/access-links";
import { createAccessLink } from "@/lib/access";
import { sendCourseAccessEmail } from "@/lib/email";
import { uploadPublicImage, deletePublicImage, isStorageConfigured } from "@/lib/storage";
import { buildMaterialLinks } from "@/lib/material-links";
import { MAX_COVER_IMAGES, readCoverImages } from "@/lib/course-covers";

const COVER_IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);
const MAX_COVER_BYTES = 8 * 1024 * 1024;


function parseMaterialLinks(formData: FormData) {
  const labels = formData.getAll("linkLabel").map(String);
  const urls = formData.getAll("linkUrl").map(String);
  return buildMaterialLinks(urls.map((url, i) => ({ url, label: labels[i] ?? "" })));
}

async function uploadCover(file: File): Promise<string | null> {
  if (!COVER_IMAGE_TYPES.has(file.type) || file.size > MAX_COVER_BYTES || !isStorageConfigured) return null;
  try {
    return await uploadPublicImage(Buffer.from(await file.arrayBuffer()), "courses");
  } catch (err) {
    console.error("[courses] error subiendo portada:", err);
    return null;
  }
}


async function resolveCoverImages(formData: FormData, previous: string[]) {
  const slots = formData.getAll("coverSlot").map(String).slice(0, MAX_COVER_IMAGES);
  const files = formData.getAll("coverImageFile").filter((f): f is File => f instanceof File && f.size > 0);
  const uploads = await Promise.all(
    files.slice(0, slots.filter((s) => s === "new").length).map(uploadCover),
  );
  let next = 0;
  let failed = false;
  const images: string[] = [];
  for (const slot of slots) {
    if (slot === "new") {
      const url = uploads[next++];
      if (url) images.push(url);
      else failed = true;
    } else if (previous.includes(slot) && !images.includes(slot)) {
      images.push(slot);
    }
  }
  return { images, failed };
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export async function createCourse(formData: FormData) {
  await requireAdmin();
  const title = String(formData.get("title") ?? "").trim();
  const courseType = String(formData.get("courseType") ?? "");
  if (!title || !COURSE_TYPES.includes(courseType as (typeof COURSE_TYPES)[number])) return;

  const slug = slugify(title);
  const existing = await prisma.course.findUnique({ where: { slug } });
  if (existing) return;

  const course = await prisma.course.create({
    data: { title, slug, courseType, description: "Descripción pendiente de completar." },
  });

  revalidatePath("/admin/cursos");
  return course.id;
}

export async function updateCourse(courseId: string, formData: FormData) {
  await requireAdmin();

  const priceRaw = formData.get("price");
  const liveDateRaw = String(formData.get("liveDate") ?? "");
  const { links, rejected } = parseMaterialLinks(formData);
  const previous = await prisma.course.findUnique({
    where: { id: courseId },
    select: { coverImageUrl: true, coverImages: true },
  });
  const previousCovers = previous ? readCoverImages(previous) : [];
  const covers = await resolveCoverImages(formData, previousCovers);

  await prisma.course.update({
    where: { id: courseId },
    data: {
      title: String(formData.get("title") ?? "").trim(),
      summary: String(formData.get("summary") ?? "").trim() || null,
      description: String(formData.get("description") ?? "").trim(),
      courseType: String(formData.get("courseType") ?? "GRABADO"),
      level: String(formData.get("level") ?? "").trim() || null,
      modality: String(formData.get("modality") ?? "").trim() || null,
      durationNote: String(formData.get("durationNote") ?? "").trim() || null,
      price: priceRaw ? Number(priceRaw) : null,
      requiresQuote: formData.get("requiresQuote") === "on",
      coverImages: covers.images,
      coverImageUrl: covers.images[0] ?? null,
      trailerVideoUrl: String(formData.get("trailerVideoUrl") ?? "").trim() || null,
      
      materialLinks: links,
      liveDate: liveDateRaw ? new Date(liveDateRaw) : null,
      liveAccessLink: String(formData.get("liveAccessLink") ?? "").trim() || null,
      liveInstructions: String(formData.get("liveInstructions") ?? "").trim() || null,
      includesMaterial: String(formData.get("includesMaterial") ?? "").trim() || null,
      requirements: String(formData.get("requirements") ?? "").trim() || null,
      isFeatured: formData.get("isFeatured") === "on",
      isPublished: formData.get("isPublished") === "on",
    },
  });

  revalidatePath("/admin/cursos");
  revalidatePath(`/admin/cursos/${courseId}`);
  revalidatePath("/cursos-online");
  revalidatePath("/");

  
  for (const url of previousCovers) {
    if (!covers.images.includes(url)) await deletePublicImage(url);
  }

  const query = new URLSearchParams();
  if (rejected.length > 0) {
    query.set("error", "drive");
    query.set("detalle", rejected.join(" | ").slice(0, 200));
  } else if (covers.failed) query.set("error", "portada");
  else query.set("guardado", "1");
  redirect(`/admin/cursos/${courseId}?${query}`);
}

export async function deleteCourse(courseId: string) {
  await requireAdmin();
  await prisma.course.delete({ where: { id: courseId } });
  revalidatePath("/admin/cursos");
  revalidatePath("/cursos-online");
  revalidatePath("/");
}

export async function addModule(courseId: string, formData: FormData) {
  await requireAdmin();
  const title = String(formData.get("title") ?? "").trim();
  if (!title) return;
  const count = await prisma.courseModule.count({ where: { courseId } });
  await prisma.courseModule.create({ data: { courseId, title, sortOrder: count } });
  revalidatePath(`/admin/cursos/${courseId}`);
}

export async function deleteModule(courseId: string, moduleId: string) {
  await requireAdmin();
  await prisma.courseModule.delete({ where: { id: moduleId } });
  revalidatePath(`/admin/cursos/${courseId}`);
}

export async function addLesson(courseId: string, moduleId: string, formData: FormData) {
  await requireAdmin();
  const title = String(formData.get("title") ?? "").trim();
  if (!title) return;
  const videoUrl = String(formData.get("videoUrl") ?? "").trim() || null;
  const durationRaw = formData.get("durationMinutes");
  const count = await prisma.lesson.count({ where: { moduleId } });
  await prisma.lesson.create({
    data: {
      moduleId,
      title,
      videoUrl,
      durationMinutes: durationRaw ? Number(durationRaw) : null,
      isFreePreview: formData.get("isFreePreview") === "on",
      sortOrder: count,
    },
  });
  revalidatePath(`/admin/cursos/${courseId}`);
}

export async function deleteLesson(courseId: string, lessonId: string) {
  await requireAdmin();
  await prisma.lesson.delete({ where: { id: lessonId } });
  revalidatePath(`/admin/cursos/${courseId}`);
}


export async function grantCourseAccess(courseId: string, formData: FormData) {
  const admin = await requireAdmin();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const name = String(formData.get("name") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  if (!email) return;

  const user = await prisma.user.upsert({
    where: { email },
    update: { name: name || undefined, phone: phone || undefined },
    create: { email, name: name || null, phone: phone || null, role: "CUSTOMER" },
  });

  const enrollment = await prisma.enrollment.upsert({
    where: { userId_courseId: { userId: user.id, courseId } },
    update: { status: "ACTIVA", grantedAt: new Date(), grantedByAdmin: admin.email ?? undefined },
    create: {
      userId: user.id,
      courseId,
      status: "ACTIVA",
      grantedAt: new Date(),
      grantedByAdmin: admin.email ?? undefined,
    },
    include: { course: true },
  });

  const token = await createAccessLink({ enrollmentId: enrollment.id });

  
  
  await sendCourseAccessEmail({ to: email, courseName: enrollment.course.title, accessUrl: accessPageUrl(token) }).catch(
    (err) => console.error("[admin] error enviando acceso al curso:", err),
  );

  revalidatePath(`/admin/cursos/${courseId}`);
}

export async function revokeCourseAccess(courseId: string, enrollmentId: string) {
  await requireAdmin();
  await prisma.enrollment.update({ where: { id: enrollmentId }, data: { status: "REVOCADA" } });
  revalidatePath(`/admin/cursos/${courseId}`);
}
