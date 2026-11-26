import { cache } from "react";
import { prisma } from "@/lib/prisma";

const DEFAULTS = {
  id: "default",
  brandName: "Celeste Platini Pastelería",
  whatsappNumber: null as string | null,
  instagramUrl: "https://www.instagram.com/celesteplatinipasteleria/",
  contactEmail: null as string | null,
  location: "San Francisco, Córdoba",
  businessHours: null as string | null,
  announcementText: null as string | null,
  announcementIsActive: false,
  deliveryPickupEnabled: true,
  deliveryShippingEnabled: false,
  paymentMethodsNote: null as string | null,
  heroImageUrl: null as string | null,
  heroTitle: null as string | null,
  heroSubtitle: null as string | null,
};


export const getSiteSettings = cache(async function getSiteSettings() {
  try {
    const existing = await prisma.siteSettings.findUnique({ where: { id: "default" } });
    if (existing) return existing;
    return await prisma.siteSettings.create({ data: DEFAULTS });
  } catch {
    
    
    return { ...DEFAULTS, updatedAt: new Date() };
  }
});

export type SiteSettingsData = Awaited<ReturnType<typeof getSiteSettings>>;
