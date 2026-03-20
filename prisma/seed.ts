import "dotenv/config";

import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "@prisma/client";

import { createPasswordHash, verifyPassword } from "../src/lib/auth/password";

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error("DATABASE_URL must be set before seeding.");
}

const prisma = new PrismaClient({
  adapter: new PrismaBetterSqlite3({
    url: databaseUrl
  })
});

async function main() {
  const username = process.env.OWNER_USERNAME;
  const password = process.env.OWNER_PASSWORD;

  if (!username || !password) {
    throw new Error("OWNER_USERNAME and OWNER_PASSWORD must be set before seeding the owner account.");
  }

  const existing = await prisma.user.findUnique({
    where: {
      username
    }
  });

  if (!existing) {
    await prisma.user.create({
      data: {
        username,
        passwordHash: createPasswordHash(password)
      }
    });
    return;
  }

  if (verifyPassword(password, existing.passwordHash)) {
    return;
  }

  await prisma.user.update({
    where: {
      username
    },
    data: {
      passwordHash: createPasswordHash(password)
    }
  });
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
