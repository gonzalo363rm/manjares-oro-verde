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
      return cloud;
    }
  }

  return url;
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

  return new PrismaClient({
    datasources: { db: { url } },
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });
}

const databaseUrl = resolveDatabaseUrl();

export const prisma =
  globalForPrisma.prisma && globalForPrisma.prismaUrl === databaseUrl
    ? globalForPrisma.prisma
    : createPrismaClient(databaseUrl);

globalForPrisma.prisma = prisma;
globalForPrisma.prismaUrl = databaseUrl;

export default prisma;
