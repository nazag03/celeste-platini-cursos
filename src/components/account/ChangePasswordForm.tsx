"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { changeOwnPassword, type PasswordState } from "@/lib/actions/students";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-full bg-cocoa text-cream px-5 py-2.5 text-sm font-medium disabled:opacity-60"
    >
      {pending ? "Guardando..." : "Cambiar contraseña"}
    </button>
  );
}


export function ChangePasswordForm() {
  const [state, formAction] = useActionState<PasswordState, FormData>(changeOwnPassword, null);

  return (
    <details className="rounded-2xl border border-cocoa/10 p-5">
      <summary className="cursor-pointer text-sm font-medium text-cocoa select-none">Cambiar mi contraseña</summary>
      <form action={formAction} className="space-y-3 mt-4 max-w-sm">
        <div>
          <label className="text-xs font-medium text-ink/60 block mb-1">Contraseña actual</label>
          <input type="password" name="current" autoComplete="current-password" className="input" />
        </div>
        <div>
          <label className="text-xs font-medium text-ink/60 block mb-1">Contraseña nueva (mín. 8 caracteres)</label>
          <input type="password" name="next" autoComplete="new-password" minLength={8} required className="input" />
        </div>
        {state?.error && <p className="text-sm text-red-600">{state.error}</p>}
        {state?.ok && <p className="text-sm text-green-700">Listo, tu contraseña se cambió.</p>}
        <SubmitButton />
      </form>
    </details>
  );
}
