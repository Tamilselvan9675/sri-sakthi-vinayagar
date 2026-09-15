/**
 * Prisma Client Singleton (Prisma v7)
 *
 * Centralized database access for the entire application.
 * Uses a singleton pattern to prevent multiple Prisma Client instances
 * during development (hot reload creates new instances).
 *
 * Prisma v7 requires a driver adapter instead of a direct connection URL.
 *
 * Usage:
 *   import { db } from "@/lib/db";
 *   const users = await db.user.findMany();
 */

import { PrismaClient } from "@/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient(): PrismaClient {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error(
      "DATABASE_URL environment variable is not set. " +
        "Copy .env.example to .env.local and configure your database.",
    );
  }

  const pool = new pg.Pool({ connectionString });
  const adapter = new PrismaPg(pool);

  return new PrismaClient({ adapter });
}

export const db: PrismaClient =
  globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = db;
}
