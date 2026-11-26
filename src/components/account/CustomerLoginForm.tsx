"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/Button";

export function CustomerLoginForm({ callbackUrl }: { callbackUrl?: string }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    const res = await signIn("credentials", { email, password, redirect: false });
    setSubmitting(false);

    if (res?.error) {
      setError("Correo o contraseña incorrectos.");
      return;
    }
    router.push(callbackUrl ?? "/cuenta");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-2xl border border-cocoa/10 bg-ivory/40 p-6">
      <div>
        <label className="text-sm font-medium text-cocoa block mb-2">Correo electrónico</label>
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="input" required autoFocus />
      </div>
      <div>
        <label className="text-sm font-medium text-cocoa block mb-2">Contraseña</label>
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="input" required />
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <Button type="submit" disabled={submitting} className="w-full">
        {submitting ? "Ingresando..." : "Ingresar"}
      </Button>
    </form>
  );
}
