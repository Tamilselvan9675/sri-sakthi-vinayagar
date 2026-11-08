import path from "path";
import { fileURLToPath } from "url";
import { buildConfig } from "payload";
import { postgresAdapter } from "@payloadcms/db-postgres";
import { lexicalEditor } from "@payloadcms/richtext-lexical";
import sharp from "sharp";
import { s3Storage } from "@payloadcms/storage-s3";
import {
  AuditLogs,
  ContactMessages,
  Donors,
  Events,
  Expenses,
  FestivalYears,
  Gallery,
  Media,
  Pages,
  TempleSettings,
  Users,
  Videos,
  Winners,
} from "./payload/collections.ts";
import { getR2StorageConfig } from "./lib/storage/r2.ts";

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

/**
 * Cloudflare R2 (S3-compatible) storage for the Media collection.
 * Credentials are server-side env vars only (never NEXT_PUBLIC_*).
 * R2_PUBLIC_URL is optional: set it to the bucket's public r2.dev / custom
 * domain so files are served straight from Cloudflare; leave it empty to have
 * Payload stream files from the (private) bucket instead.
 */
const r2 = getR2StorageConfig();

if (!r2.enabled && process.env.NODE_ENV === "production") {
  console.warn(
    `[payload] Cloudflare R2 is not configured (${r2.missing.join(" / ")}). Uploads fall back to local disk, which is not persistent on most hosts.`,
  );
}

export default buildConfig({
  // The admin panel lives at /cms (the existing /[locale]/admin stays untouched).
  routes: { admin: "/cms", api: "/api" },
  admin: {
    user: Users.slug,
    importMap: { baseDir: path.resolve(dirname) },
    meta: { titleSuffix: " – Sri Sakthi Vinayagar CMS" },
  },
  collections: [
    Users,
    Media,
    TempleSettings,
    Pages,
    FestivalYears,
    Events,
    Winners,
    Gallery,
    Videos,
    Donors,
    Expenses,
    ContactMessages,
    AuditLogs,
  ],
  // Tamil + English content. Static UI strings stay in next-intl JSON files.
  localization: {
    locales: [
      { label: "English", code: "en" },
      { label: "தமிழ்", code: "ta" },
    ],
    defaultLocale: "en",
    fallback: true,
  },
  editor: lexicalEditor(),
  // Reject oversized uploads early (15 MB).
  upload: { limits: { fileSize: 15 * 1024 * 1024 } },
  plugins: [
    s3Storage({
      enabled: r2.enabled,
      alwaysInsertFields: true,
      collections: {
        "donor-files": true,
        "expense-files": true,
        media: r2.publicUrl
          ? {
              disablePayloadAccessControl: true,
              generateFileURL: ({ filename: name, prefix }) =>
                [r2.publicUrl, prefix, name].filter(Boolean).join("/"),
            }
          : true,
      },
      bucket: r2.bucket ?? "",
      config: {
        region: "auto",
        endpoint: r2.endpoint,
        credentials: {
          accessKeyId: r2.accessKeyId ?? "",
          secretAccessKey: r2.secretAccessKey ?? "",
        },
        forcePathStyle: true,
      },
    }),
  ],
  secret: process.env.PAYLOAD_SECRET || "",
  typescript: { outputFile: path.resolve(dirname, "payload-types.ts") },
  db: postgresAdapter({
    pool: { connectionString: process.env.DATABASE_URL },
    // Isolated Postgres schema: Payload never touches the existing Prisma tables.
    schemaName: "payload",
    // Schema changes go through reviewed migrations (src/migrations), never auto-push.
    push: false,
    migrationDir: path.resolve(dirname, "migrations"),
  }),
  sharp,
});
