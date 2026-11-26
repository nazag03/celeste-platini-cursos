import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

  const staticRoutes = [
    "",
    "/cursos-online",
    "/sobre-celeste",
    "/contacto",
    "/legales/terminos",
    "/legales/privacidad",
    "/legales/cookies",
    "/legales/cancelaciones",
    "/legales/envios",
  ].map((path) => ({ url: `${siteUrl}${path}`, lastModified: new Date() }));

  const courses = await prisma.course.findMany({
    where: { isPublished: true },
    select: { slug: true, updatedAt: true },
  });

  return [
    ...staticRoutes,
    ...courses.map((c) => ({ url: `${siteUrl}/cursos-online/${c.slug}`, lastModified: c.updatedAt })),
  ];
}
