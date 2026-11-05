import { auth } from "@/auth";
import { isAdminEmail } from "@/lib/admin";

export type AdminSession = {
  userId: string;
  email: string;
};

export async function requireAdmin(): Promise<
  { ok: true; admin: AdminSession } | { ok: false; error: string }
> {
  const session = await auth();
  const email = session?.user?.email;
  const userId = session?.user?.id;

  if (!email || !userId || !isAdminEmail(email)) {
    return { ok: false, error: "No autorizado" };
  }

  return { ok: true, admin: { userId, email } };
}
