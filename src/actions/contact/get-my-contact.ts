"use server";

import { auth } from "@/auth";
import type { MyContact } from "@/actions/contact/schemas";
import { prisma } from "@/lib/prisma";

export async function getMyContact(): Promise<MyContact | null> {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return null;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      name: true,
      email: true,
      contactName: true,
      contactPhone: true,
      contactEmail: true,
      orders: {
        orderBy: { createdAt: "desc" },
        take: 1,
        select: {
          contactName: true,
          contactPhone: true,
          contactEmail: true,
        },
      },
    },
  });

  if (!user) return null;

  const lastOrder = user.orders[0];

  const name =
    user.contactName?.trim() ||
    lastOrder?.contactName?.trim() ||
    user.name?.trim() ||
    user.email.split("@")[0] ||
    "";

  const phone =
    user.contactPhone?.trim() || lastOrder?.contactPhone?.trim() || "";

  const email =
    user.contactEmail?.trim() ||
    lastOrder?.contactEmail?.trim() ||
    user.email ||
    "";

  return { name, phone, email };
}
