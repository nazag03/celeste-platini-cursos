"use server";

import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

export type AuthActionState = { error?: string; fieldErrors?: Record<string, string>; success?: boolean } | null;

const registerSchema = z.object({
  name: z.string().trim().min(2, "Ingresá tu nombre."),
  email: z.string().trim().email("Ingresá un correo válido."),
  password: z.string().min(8, "La contraseña debe tener al menos 8 caracteres."),
});

export async function registerCustomer(_prev: AuthActionState, formData: FormData): Promise<AuthActionState> {
  const parsed = registerSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) fieldErrors[String(issue.path[0])] = issue.message;
    return { error: "Revisá los datos ingresados.", fieldErrors };
  }

  const email = parsed.data.email.toLowerCase();
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing?.passwordHash) {
    return { error: "Ya existe una cuenta con ese correo. Probá iniciar sesión.", fieldErrors: { email: "Correo ya registrado" } };
  }

  const passwordHash = await bcrypt.hash(parsed.data.password, 12);

  
  
  
  
  if (existing) {
    const courses = await prisma.enrollment.count({ where: { userId: existing.id, status: "ACTIVA" } });
    if (courses > 0) {
      return {
        error: "Ese mail ya tiene cursos cargados. Escribile a Celeste por WhatsApp y te activa la cuenta con una contraseña.",
        fieldErrors: { email: "Mail con cursos" },
      };
    }
    await prisma.user.update({ where: { id: existing.id }, data: { name: parsed.data.name, passwordHash } });
    return { success: true };
  }

  await prisma.user.create({ data: { email, name: parsed.data.name, passwordHash, role: "CUSTOMER" } });

  return { success: true };
}
