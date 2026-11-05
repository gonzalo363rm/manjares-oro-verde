import { generateRawCode } from "@/lib/order-code";
import { prisma } from "@/lib/prisma";

const MAX_ATTEMPTS = 8;

export async function generateUniqueOrderCode(): Promise<string> {
  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    const code = generateRawCode();
    const existing = await prisma.order.findUnique({
      where: { code },
      select: { id: true },
    });
    if (!existing) return code;
  }
  throw new Error("No se pudo generar un código de pedido único");
}
