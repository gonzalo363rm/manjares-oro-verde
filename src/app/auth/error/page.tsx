import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Title } from "@/components/ui/Title";

type Props = {
  searchParams: Promise<{ error?: string }>;
};

const MESSAGES: Record<string, { title: string; body: string }> = {
  AccessDenied: {
    title: "Acceso denegado",
    body: "Google o Auth rechazaron el login. Si tu app de Google está en modo Testing, agregá gonzalo363rm@gmail.com como usuario de prueba en Google Cloud → OAuth consent screen → Test users. También verificá que el redirect URI sea http://localhost:3000/api/auth/callback/google.",
  },
  Configuration: {
    title: "Configuración incompleta",
    body: "Revisá GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, AUTH_SECRET y AUTH_URL en el .env.",
  },
  Default: {
    title: "No se pudo iniciar sesión",
    body: "Probá de nuevo. Si sigue fallando, mirá la consola del servidor (npm run dev).",
  },
};

export default async function AuthErrorPage({ searchParams }: Props) {
  const { error } = await searchParams;
  const key = error && MESSAGES[error] ? error : "Default";
  const msg = MESSAGES[key]!;

  return (
    <div className="fade-in mx-auto max-w-lg px-5 py-10">
      <Title title={msg.title} subtitle={error ? `Código: ${error}` : undefined} />
      <p className="text-sm leading-relaxed text-muted-foreground">{msg.body}</p>
      <div className="mt-6 flex flex-wrap gap-3">
        <Button asChild>
          <Link href="/auth/login">Reintentar login</Link>
        </Button>
        <Button asChild variant="secondary">
          <Link href="/">Volver al inicio</Link>
        </Button>
      </div>
    </div>
  );
}
