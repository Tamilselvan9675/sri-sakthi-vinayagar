/**
 * Prisma Configuration (Prisma v7)
 *
 * Configures the Prisma CLI with datasource URL and migration settings.
 * In v7, the connection URL is no longer in schema.prisma — it's here.
 *
 * @see https://pris.ly/d/config-datasource
 */

import "dotenv/config";
import { defineConfig, env } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
  datasource: {
    url: env("DATABASE_URL"),
  },
});
