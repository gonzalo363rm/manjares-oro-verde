import Link from "next/link";

import { signIn } from "@/auth";
import { Button } from "@/components/ui/button";
import { Title } from "@/components/ui/Title";

type Props = {
  searchParams: Promise<{ callbackUrl?: string; error?: string }>;
};

export default async function LoginPage({ searchParams }: Props) {
  const { callbackUrl, error } = await searchParams;
  const redirectTo = callbackUrl || "/mis-pedidos";

  return (
    <div className="fade-in mx-auto max-w-md px-5 py-10">
      <Title
        title="Iniciar sesión"
        subtitle="Google para historial de pedidos y reseñas"
      />
      {error === "admin" ? (
        <p className="mb-4 rounded-md bg-amber-50 px-3 py-2 text-sm text-amber-800">
          Esa cuenta no tiene acceso al panel de administración.
        </p>
      ) : null}

      <form
        action={async () => {
          "use server";
          await signIn("google", { redirectTo });
        }}
      >
        <Button type="submit" size="lg" className="w-full">
          Continuar con Google
        </Button>
      </form>

      <Button asChild variant="link" className="mt-4 w-full">
        <Link href="/">Volver al inicio</Link>
      </Button>
    </div>
  );
}
