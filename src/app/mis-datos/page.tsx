import { redirect } from "next/navigation";

import { getMyContact } from "@/actions/contact";
import { auth } from "@/auth";
import { ContactForm } from "@/components/contact/ContactForm";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { TextLink } from "@/components/ui/TextLink";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Mis datos de contacto | Manjares de Oro Verde",
  robots: { index: false, follow: false },
};

export default async function MisDatosPage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/auth/login?callbackUrl=/mis-datos");
  }

  const contact = await getMyContact();

  return (
    <main className="mx-auto min-h-screen max-w-lg px-4 py-10">
      <TextLink href="/" icon="back">
        Inicio
      </TextLink>
      <div className="mt-2 mb-6">
        <h1 className="text-2xl font-bold text-stone-900">
          Mis datos de contacto
        </h1>
        <p className="text-sm text-stone-600">{session.user.email}</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Contacto</CardTitle>
          <CardDescription>
            Estos datos se usan para agilizar tus pedidos. Podés actualizarlos
            cuando quieras.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ContactForm
            initial={{
              contactName: contact?.name ?? "",
              contactPhone: contact?.phone ?? "",
              contactEmail: contact?.email ?? session.user.email ?? "",
            }}
          />
        </CardContent>
      </Card>
    </main>
  );
}
