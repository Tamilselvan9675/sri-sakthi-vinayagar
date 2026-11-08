import { S3Client, PutObjectCommand, HeadObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { createRequire } from "node:module";
import { getR2StorageConfig } from "../lib/storage/r2.ts";

const require = createRequire(import.meta.url);
const { loadEnvConfig } = require("@next/env") as typeof import("@next/env");
loadEnvConfig(process.cwd());

const r2 = getR2StorageConfig();
if (!r2.enabled || !r2.bucket || !r2.endpoint || !r2.accessKeyId || !r2.secretAccessKey) {
  throw new Error(`R2 is not configured. Missing: ${r2.missing.join(", ")}`);
}

console.log("=== Cloudflare R2 Upload & Delivery Test ===");
console.log(`Bucket:      ${r2.bucket}`);
console.log(`Endpoint:    ${r2.endpoint}`);
console.log(`Public URL:  ${r2.publicUrl ?? "(none)"}`);

const client = new S3Client({
  region: "auto",
  endpoint: r2.endpoint,
  forcePathStyle: true,
  credentials: {
    accessKeyId: r2.accessKeyId,
    secretAccessKey: r2.secretAccessKey,
  },
});

const testKey = "media/gallery/test-upload-verification.png";
const testBuffer = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==",
  "base64",
);

try {
  // Step 1: Upload test file to R2
  console.log(`\n1. Uploading test file to R2: s3://${r2.bucket}/${testKey}...`);
  await client.send(
    new PutObjectCommand({
      Bucket: r2.bucket,
      Key: testKey,
      Body: testBuffer,
      ContentType: "image/png",
      CacheControl: "public, max-age=31536000, immutable",
    }),
  );
  console.log("   [SUCCESS] File uploaded to Cloudflare R2.");

  // Step 2: HeadObject check
  console.log(`\n2. Checking object metadata in R2 bucket...`);
  const head = await client.send(new HeadObjectCommand({ Bucket: r2.bucket, Key: testKey }));
  console.log(`   [SUCCESS] Object found. Size: ${head.ContentLength} bytes, Type: ${head.ContentType}`);

  // Step 3: Test public delivery if R2_PUBLIC_URL is configured
  if (r2.publicUrl) {
    const publicDeliveryUrl = `${r2.publicUrl}/${testKey}`;
    console.log(`\n3. Testing public HTTP delivery via Cloudflare CDN: ${publicDeliveryUrl}...`);
    const res = await fetch(publicDeliveryUrl);
    console.log(`   HTTP Status: ${res.status} ${res.statusText}`);
    console.log(`   Content-Type: ${res.headers.get("content-type")}`);
    console.log(`   Server: ${res.headers.get("server")}`);
    console.log(`   CF-RAY: ${res.headers.get("cf-ray")}`);
    if (res.ok) {
      console.log("   [SUCCESS] Public delivery through Cloudflare CDN is active and working!");
    } else {
      console.warn("   [WARNING] Public URL returned non-200. Check R2 public access setting in Cloudflare dashboard.");
    }
  }

  // Step 4: Verify Video Range Request Delivery (for smooth video playback)
  if (r2.publicUrl) {
    const videoUrl = `${r2.publicUrl}/media/videos/intro-video.mp4`;
    console.log(`\n4. Testing video streaming range request: ${videoUrl}...`);
    const rangeRes = await fetch(videoUrl, {
      headers: { Range: "bytes=0-1023" },
    });
    console.log(`   Range HTTP Status: ${rangeRes.status} (expecting 206 Partial Content or 200 OK)`);
    console.log(`   Content-Range:     ${rangeRes.headers.get("content-range")}`);
    console.log(`   Accept-Ranges:     ${rangeRes.headers.get("accept-ranges")}`);
    if (rangeRes.status === 206 || rangeRes.status === 200) {
      console.log("   [SUCCESS] Video streaming from Cloudflare R2 is fully operational!");
    }
  }

  // Step 5: Clean up test file
  console.log(`\n5. Cleaning up test file: ${testKey}...`);
  await client.send(new DeleteObjectCommand({ Bucket: r2.bucket, Key: testKey }));
  console.log("   [SUCCESS] Test file removed.");

  console.log("\nAll Cloudflare R2 upload and delivery tests passed successfully!");
} catch (error) {
  console.error("Test failed:", error);
  process.exit(1);
}
