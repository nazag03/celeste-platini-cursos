"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-guard";

export async function updateSiteSettings(formData: FormData) {
  await requireAdmin();

  const get = (key: string) => {
    const value = String(formData.get(key) ?? "").trim();
    return value === "" ? null : value;
  };

  await prisma.siteSettings.upsert({
    where: { id: "default" },
    update: {
      brandName: get("brandName") ?? "Celeste Platini Pastelería",
      whatsappNumber: get("whatsappNumber"),
      instagramUrl: get("instagramUrl"),
      contactEmail: get("contactEmail"),
      location: get("location"),
      businessHours: get("businessHours"),
      announcementText: get("announcementText"),
      announcementIsActive: formData.get("announcementIsActive") === "on",
      deliveryPickupEnabled: formData.get("deliveryPickupEnabled") === "on",
      deliveryShippingEnabled: formData.get("deliveryShippingEnabled") === "on",
      paymentMethodsNote: get("paymentMethodsNote"),
      heroTitle: get("heroTitle"),
      heroSubtitle: get("heroSubtitle"),
    },
    create: {
      id: "default",
      brandName: get("brandName") ?? "Celeste Platini Pastelería",
      whatsappNumber: get("whatsappNumber"),
      instagramUrl: get("instagramUrl"),
      contactEmail: get("contactEmail"),
      location: get("location"),
      businessHours: get("businessHours"),
      announcementText: get("announcementText"),
      announcementIsActive: formData.get("announcementIsActive") === "on",
      deliveryPickupEnabled: formData.get("deliveryPickupEnabled") === "on",
      deliveryShippingEnabled: formData.get("deliveryShippingEnabled") === "on",
      paymentMethodsNote: get("paymentMethodsNote"),
      heroTitle: get("heroTitle"),
      heroSubtitle: get("heroSubtitle"),
    },
  });

  revalidatePath("/", "layout");
}
