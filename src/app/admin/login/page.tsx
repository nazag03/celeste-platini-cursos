import Image from "next/image";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { LoginForm } from "@/components/admin/LoginForm";

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string; error?: string }>;
}) {
  const session = await auth();
  const { callbackUrl } = await searchParams;

  if (session?.user?.role === "ADMIN") {
    redirect(callbackUrl ?? "/admin");
  }

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-5">
      <div className="w-full max-w-sm">
        <Image
          src="/brand/logo-verde.png"
          alt="Celeste Platini Pastelería"
          width={588}
          height={316}
          priority
          className="h-24 w-auto mx-auto mb-6"
        />
        <h1 className="font-brand text-3xl text-cocoa mb-8 text-center">Panel de administración</h1>
        <LoginForm callbackUrl={callbackUrl} />
      </div>
    </div>
  );
}
