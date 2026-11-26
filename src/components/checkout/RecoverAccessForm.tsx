"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { CheckCircle2, Loader2, Mail } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { resendAccess } from "@/lib/actions/payments";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Mail className="h-4 w-4" />} Reenviarme el acceso
    </Button>
  );
}

export function RecoverAccessForm() {
  const [state, formAction] = useActionState(resendAccess, null);

  return (
    <form action={formAction} className="rounded-2xl border border-cocoa/10 bg-ivory/40 p-5 max-w-md">
      <label htmlFor="recover-email" className="block text-sm font-medium text-cocoa mb-2">
        Tu mail
      </label>
      <input
        id="recover-email"
        name="email"
        type="email"
        required
        autoComplete="email"
        placeholder="tunombre@gmail.com"
        className="input mb-3"
      />
      {state?.error && <p className="text-sm text-red-700 mb-3">{state.error}</p>}
      {state?.notice && (
        <p className="flex items-start gap-2 text-sm text-green-800 mb-3">
          <CheckCircle2 className="h-4 w-4 mt-0.5 shrink-0" /> {state.notice}
        </p>
      )}
      <SubmitButton />
    </form>
  );
}
