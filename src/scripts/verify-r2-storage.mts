import { S3Client, HeadBucketCommand } from "@aws-sdk/client-s3";
import { createRequire } from "node:module";
import { getR2StorageConfig } from "../lib/storage/r2.ts";

const require = createRequire(import.meta.url);
const { loadEnvConfig } = require("@next/env") as typeof import("@next/env");
loadEnvConfig(process.cwd());

const r2 = getR2StorageConfig();
if (!r2.enabled || !r2.bucket || !r2.endpoint || !r2.accessKeyId || !r2.secretAccessKey) {
  throw new Error(`R2 is not configured. Set: ${r2.missing.join(", ")}`);
}

const client = new S3Client({
  region: "auto",
  endpoint: r2.endpoint,
  forcePathStyle: true,
  credentials: {
    accessKeyId: r2.accessKeyId,
    secretAccessKey: r2.secretAccessKey,
  },
});

await client.send(new HeadBucketCommand({ Bucket: r2.bucket }));
console.log(`R2 bucket "${r2.bucket}" is reachable at ${r2.endpoint}.`);
console.log(
  r2.publicUrl
    ? `Public media will be served from ${r2.publicUrl}.`
    : "Media will be served by Payload through the application URL.",
);
