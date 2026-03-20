import "server-only";

import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "@prisma/client";

import { env } from "@/lib/config/env";

const globalForPrisma = globalThis as typeof globalThis & {
  prismaAdapter?: PrismaBetterSqlite3;
  prisma?: PrismaClient;
};

const adapter =
  globalForPrisma.prismaAdapter ??
  new PrismaBetterSqlite3({
    url: env.databaseUrl
  });

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter,
    log: ["warn", "error"]
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prismaAdapter = adapter;
  globalForPrisma.prisma = prisma;
}
