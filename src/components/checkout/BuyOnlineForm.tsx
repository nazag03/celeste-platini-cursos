"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { CreditCard, Loader2, FolderOpen } from "lucide-react";
import { Button } from "@/components/ui/Button";
import type { BuyState } from "@/lib/actions/payments";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" size="lg" disabled={pending} className="w-full sm:w-auto">
      {pending ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" /> Yendo a Mercado Pago...
        </>
      ) : (
        <>
          <CreditCard className="h-4 w-4" /> Pagar con Mercado Pago
        </>
      )}
    </Button>
  );
}


export function BuyOnlineForm({
  action,
  kind,
}: {
  action: (prev: BuyState, formData: FormData) => Promise<BuyState>;
  kind: "curso" | "recetario";
}) {
  const [state, formAction] = useActionState(action, null);

  return (
    <form action={formAction} className="rounded-2xl border border-cocoa/10 bg-ivory/40 p-5 mb-4">
      <SubmitButton />
      {state?.error && <p className="text-sm text-red-700 mt-3">{state.error}</p>}
      <p className="flex items-start gap-2 text-sm text-ink/70 mt-4">
        <FolderOpen className="h-4 w-4 mt-0.5 shrink-0 text-cocoa" />
        <span>
          Apenas se apruebe el pago, te aparecen en pantalla los <strong>links de Google Drive</strong> con{" "}
          {kind === "curso" ? "el curso (videos y PDF)" : "el recetario"}
          {kind === "curso" ? <>, y quedan guardados en <strong>Mi cuenta</strong>.</> : ", para verlo o descargarlo."}
        </span>
      </p>
      <p className="text-xs text-ink/40 mt-3">Podés pagar con tarjeta de débito, crédito o dinero en Mercado Pago.</p>
    </form>
  );
}
