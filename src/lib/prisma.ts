import { PrismaClient } from "@prisma/client";

function resolveDatabaseUrl(): string {
  const url =
    process.env.DATABASE_URL_POOLED ||
    process.env.DATABASE_URL ||
    process.env.PRISMA_DATABASE_URL ||
    process.env.POSTGRES_URL ||
    "";

  if (!url) {
    throw new Error(
      "Missing DATABASE_URL (or DATABASE_URL_POOLED / PRISMA_DATABASE_URL / POSTGRES_URL)"
    );
  }

  // Guard: avoid silently using a leftover local URL while cloud env exists.
  if (url.includes("localhost") || url.includes("127.0.0.1")) {
    const cloud =
      process.env.PRISMA_DATABASE_URL ||
      process.env.POSTGRES_URL ||
      process.env.DATABASE_URL_POOLED;
    if (cloud && !cloud.includes("localhost") && !cloud.includes("127.0.0.1")) {
      console.warn(
        "[prisma] DATABASE_URL pointed to localhost; using cloud URL instead"
      );
      return withConnectTimeout(cloud);
    }
  }

  return withConnectTimeout(url);
}

/** Evita cuelgues largos y da margen a cold start de Prisma Postgres. */
function withConnectTimeout(url: string): string {
  if (/[?&]connect_timeout=/i.test(url)) return url;
  return url.includes("?")
    ? `${url}&connect_timeout=10`
    : `${url}?connect_timeout=10`;
}

function isRetryableDbError(error: unknown): boolean {
  const message = error instanceof Error ? error.message : String(error);
  const name = error instanceof Error ? error.name : "";
  return (
    name === "PrismaClientInitializationError" ||
    message.includes("Can't reach database server") ||
    message.includes("P1001") ||
    message.includes("P1017") ||
    message.includes("Connection reset") ||
    message.includes("ECONNRESET") ||
    message.includes("ETIMEDOUT")
  );
}

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
  prismaUrl: string | undefined;
};

function createPrismaClient(url: string) {
  try {
    const host = new URL(url.replace(/^postgres(ql)?:/, "https:")).host;
    console.info(`[prisma] connecting to ${host}`);
  } catch {
    console.info("[prisma] connecting (host parse failed)");
  }

  const base = new PrismaClient({
    datasources: { db: { url } },
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

  // Reintentos cortos ante caídas intermitentes del pooler / cold start.
  return base.$extends({
    query: {
      async $allOperations({ args, query }) {
        const attempts = 3;
        let lastError: unknown;
        for (let i = 0; i < attempts; i++) {
          try {
            return await query(args);
          } catch (error) {
            lastError = error;
            if (!isRetryableDbError(error) || i === attempts - 1) throw error;
            await new Promise((r) => setTimeout(r, 350 * (i + 1)));
            try {
              await base.$connect();
            } catch {
              // el próximo query reintenta igual
            }
          }
        }
        throw lastError;
      },
    },
  }) as unknown as PrismaClient;
}

const databaseUrl = resolveDatabaseUrl();

export const prisma =
  globalForPrisma.prisma && globalForPrisma.prismaUrl === databaseUrl
    ? globalForPrisma.prisma
    : createPrismaClient(databaseUrl);

globalForPrisma.prisma = prisma;
globalForPrisma.prismaUrl = databaseUrl;

export default prisma;
