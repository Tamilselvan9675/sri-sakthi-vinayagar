import { CopyObjectCommand, DeleteObjectCommand, HeadObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { readFile } from "node:fs/promises";
import { createRequire } from "node:module";
import path from "node:path";
import { Client } from "pg";
import { resolveStorageFolder } from "../lib/storage/folders.ts";
import { getR2StorageConfig } from "../lib/storage/r2.ts";

/**
 * One-time migration of local Payload uploads into Cloudflare R2 folders:
 *   images -> media/gallery/, videos -> media/videos/, finance files -> financial-reports/
 *
 * - Uploads from the local directory (or copies an existing legacy object), then
 *   updates `prefix` + URL columns. Current Payload S3 reads files at
 *   `<prefix>/<filename>`; it does not include `_objectKey` in the object path.
 * - Safe to re-run. `--dry-run` only reports. Local files are never deleted;
 *   legacy root objects are removed only with `--delete-legacy`.
 */
const require = createRequire(import.meta.url);
const { loadEnvConfig } = require("@next/env") as typeof import("@next/env");
loadEnvConfig(process.cwd());

const dryRun = process.argv.includes("--dry-run");
const deleteLegacy = process.argv.includes("--delete-legacy");

type FileRef = { column: string; filename: string | null | undefined; mimeType: string | null | undefined; urlColumn: string };
type Row = Record<string, string | number | null> & { id: number; prefix: string | null; _object_key: string | null };

type UploadCollection = { slug: string; table: string; directory: string; files: (row: Row) => FileRef[] };

const collections: UploadCollection[] = [
  {
    slug: "media",
    table: "media",
    directory: "media",
    files: (row) => [
      { column: "filename", filename: row.filename as string, mimeType: row.mime_type as string, urlColumn: "url" },
      { column: "sizes_thumbnail_filename", filename: row.sizes_thumbnail_filename as string, mimeType: row.sizes_thumbnail_mime_type as string, urlColumn: "sizes_thumbnail_url" },
      { column: "sizes_card_filename", filename: row.sizes_card_filename as string, mimeType: row.sizes_card_mime_type as string, urlColumn: "sizes_card_url" },
    ],
  },
  {
    slug: "donor-files",
    table: "donor_files",
    directory: "donor-files",
    files: (row) => [{ column: "filename", filename: row.filename as string, mimeType: row.mime_type as string, urlColumn: "url" }],
  },
  {
    slug: "expense-files",
    table: "expense_files",
    directory: "expense-files",
    files: (row) => [{ column: "filename", filename: row.filename as string, mimeType: row.mime_type as string, urlColumn: "url" }],
  },
];

function joinKey(...parts: Array<string | null | undefined>): string {
  return parts
    .filter((part): part is string => Boolean(part))
    .flatMap((part) => part.split("/"))
    .filter((part) => part && part !== "." && part !== "..")
    .join("/");
}

async function objectExists(client: S3Client, bucket: string, key: string): Promise<boolean> {
  try {
    await client.send(new HeadObjectCommand({ Bucket: bucket, Key: key }));
    return true;
  } catch (error) {
    const statusCode = (error as { $metadata?: { httpStatusCode?: number } }).$metadata?.httpStatusCode;
    if (statusCode === 404) return false;
    throw error;
  }
}

const r2 = getR2StorageConfig();
if (!r2.enabled || !r2.bucket || !r2.endpoint || !r2.accessKeyId || !r2.secretAccessKey) {
  throw new Error(`R2 is not configured. Set: ${r2.missing.join(", ")}`);
}
if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not configured.");
}
const bucket = r2.bucket;

const storage = new S3Client({
  region: "auto",
  endpoint: r2.endpoint,
  forcePathStyle: true,
  credentials: { accessKeyId: r2.accessKeyId, secretAccessKey: r2.secretAccessKey },
});
const database = new Client({ connectionString: process.env.DATABASE_URL });
const counts = { uploaded: 0, copied: 0, present: 0, rows: 0, legacyDeleted: 0 };

/** Mirrors the URLs Payload itself generates for each collection. */
function publicFileUrl(slug: string, prefix: string, filename: string): string {
  if (slug === "media" && r2.publicUrl) return [r2.publicUrl, prefix, filename].join("/");
  return `/api/${slug}/file/${encodeURIComponent(filename)}`;
}

await database.connect();
try {
  for (const collection of collections) {
    const records = await database.query<Row>(
      `SELECT *, "_objectkey" AS "_object_key" FROM "payload"."${collection.table}"`,
    );

    for (const row of records.rows) {
      const files = collection.files(row).filter((file) => file.filename);
      const primary = files[0];
      if (!primary) continue;

      // Folder is decided by the main file; resized variants live beside it.
      const folder = resolveStorageFolder(collection.slug, primary.mimeType);
      const updates: Record<string, string> = { prefix: folder };

      for (const file of files) {
        const filename = file.filename as string;
        if (path.basename(filename) !== filename) throw new Error(`Unsafe filename in ${collection.slug}: ${filename}`);

        const newKey = joinKey(folder, filename);
        const legacyKeys = [
          // Current adapter path before a prefix was assigned.
          joinKey(row.prefix, filename),
          // Paths generated by older migration versions.
          joinKey(row.prefix, row._object_key, filename),
          joinKey(folder, row._object_key, filename),
        ].filter((key, index, keys) => key && key !== newKey && keys.indexOf(key) === index);

        if (await objectExists(storage, bucket, newKey)) {
          counts.present += 1;
        } else {
          const legacyKey = await (async () => {
            for (const key of legacyKeys) {
              if (await objectExists(storage, bucket, key)) return key;
            }
            return null;
          })();

          if (legacyKey) {
            if (!dryRun) {
              await storage.send(new CopyObjectCommand({ Bucket: bucket, Key: newKey, CopySource: `${bucket}/${legacyKey.split("/").map(encodeURIComponent).join("/")}` }));
            }
            counts.copied += 1;
            console.log(`${dryRun ? "[dry-run] " : ""}Copied ${legacyKey} -> ${newKey}`);
          } else {
            const body = await readFile(path.join(process.cwd(), collection.directory, filename));
            if (!dryRun) {
              await storage.send(new PutObjectCommand({ Bucket: bucket, Key: newKey, Body: body, ContentType: file.mimeType ?? "application/octet-stream" }));
            }
            counts.uploaded += 1;
            console.log(`${dryRun ? "[dry-run] " : ""}Uploaded ${collection.directory}/${filename} -> ${newKey}`);
          }
        }
        updates[file.urlColumn] = publicFileUrl(collection.slug, folder, filename);
      }

      if (!dryRun) {
        const columns = Object.keys(updates);
        await database.query(
          `UPDATE "payload"."${collection.table}" SET ${columns.map((c, i) => `"${c}" = $${i + 1}`).join(", ")} WHERE "id" = $${columns.length + 1}`,
          [...columns.map((c) => updates[c]), row.id],
        );

        // Remove the superseded root-level object only when explicitly requested.
        if (deleteLegacy) {
          for (const file of files) {
            const filename = file.filename as string;
            const newKey = joinKey(folder, filename);
            const legacyKeys = [
              joinKey(row.prefix, filename),
              joinKey(row.prefix, row._object_key, filename),
              joinKey(folder, row._object_key, filename),
            ].filter((key, index, keys) => key && key !== newKey && keys.indexOf(key) === index);
            for (const legacyKey of legacyKeys) {
              if (await objectExists(storage, bucket, legacyKey)) {
                await storage.send(new DeleteObjectCommand({ Bucket: bucket, Key: legacyKey }));
                counts.legacyDeleted += 1;
              }
            }
          }
        }
      }
      counts.rows += 1;
    }
  }
} finally {
  await database.end();
}

console.log(
  `${dryRun ? "[dry-run] " : ""}R2 migration complete: ${counts.rows} records, ${counts.uploaded} uploaded, ${counts.copied} copied from legacy keys, ${counts.present} already in place, ${counts.legacyDeleted} legacy objects deleted. Local files were not deleted.`,
);
