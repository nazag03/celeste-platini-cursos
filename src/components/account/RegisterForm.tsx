"use client";

import { useActionState, useEffect, useState } from "react";
import { useFormStatus } from "react-dom";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { registerCustomer, type AuthActionState } from "@/lib/actions/customer-auth";

export function RegisterForm({ callbackUrl }: { callbackUrl?: string }) {
  const router = useRouter();
  const [state, formAction] = useActionState<AuthActionState, FormData>(registerCustomer, null);
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const signingIn = Boolean(state?.success);

  useEffect(() => {
    if (!state?.success) return;
    signIn("credentials", { email, password, redirect: false }).then(() => {
      router.push(callbackUrl ?? "/cuenta");
      router.refresh();
    });
  }, [state?.success, email, password, callbackUrl, router]);

  return (
    <form action={formAction} className="space-y-4 rounded-2xl border border-cocoa/10 bg-ivory/40 p-6">
      <div>
        <label className="text-sm font-medium text-cocoa block mb-2">Nombre</label>
        <input name="name" className="input" required />
        {state?.fieldErrors?.name && <p className="text-xs text-red-600 mt-1">{state.fieldErrors.name}</p>}
      </div>
      <div>
        <label className="text-sm font-medium text-cocoa block mb-2">Correo electrónico</label>
        <input type="email" name="email" value={email} onChange={(e) => setEmail(e.target.value)} className="input" required />
        {state?.fieldErrors?.email && <p className="text-xs text-red-600 mt-1">{state.fieldErrors.email}</p>}
      </div>
      <div>
        <label className="text-sm font-medium text-cocoa block mb-2">Contraseña</label>
        <input type="password" name="password" value={password} onChange={(e) => setPassword(e.target.value)} className="input" required minLength={8} />
        {state?.fieldErrors?.password && <p className="text-xs text-red-600 mt-1">{state.fieldErrors.password}</p>}
      </div>
      {state?.error && <p className="text-sm text-red-600">{state.error}</p>}
      <SubmitButton signingIn={signingIn} />
    </form>
  );
}

function SubmitButton({ signingIn }: { signingIn: boolean }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending || signingIn} className="w-full rounded-full bg-cocoa text-cream px-5 py-3 text-sm font-medium disabled:opacity-60">
      {pending || signingIn ? "Creando cuenta..." : "Crear cuenta"}
    </button>
  );
}
