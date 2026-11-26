"use server";

import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { requireAdmin } from "@/lib/auth-guard";

const MIN_PASSWORD = 8;


export async function setStudentPassword(userId: string, formData: FormData) {
  await requireAdmin();
  const password = String(formData.get("password") ?? "");
  const q = String(formData.get("q") ?? "");
  const back = (params: Record<string, string>) =>
    `/admin/alumnos?${new URLSearchParams({ ...(q ? { q } : {}), ...params })}`;

  if (password.length < MIN_PASSWORD) redirect(back({ error: "corta" }));

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user || user.role !== "CUSTOMER") redirect(back({ error: "usuario" }));

  await prisma.user.update({ where: { id: userId }, data: { passwordHash: await bcrypt.hash(password, 12) } });
  revalidatePath("/admin/alumnos");
  redirect(back({ ok: user.email }));
}

export type PasswordState = { error?: string; ok?: boolean } | null;


export async function changeOwnPassword(_prev: PasswordState, formData: FormData): Promise<PasswordState> {
  const session = await auth();
  if (!session?.user?.id) return { error: "Tu sesión venció. Volvé a ingresar." };

  const current = String(formData.get("current") ?? "");
  const next = String(formData.get("next") ?? "");
  if (next.length < MIN_PASSWORD) return { error: `La contraseña nueva debe tener al menos ${MIN_PASSWORD} caracteres.` };

  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!user) return { error: "No encontramos tu cuenta." };
  if (user.passwordHash && !(await bcrypt.compare(current, user.passwordHash))) {
    return { error: "La contraseña actual no es correcta." };
  }

  await prisma.user.update({ where: { id: user.id }, data: { passwordHash: await bcrypt.hash(next, 12) } });
  return { ok: true };
}
