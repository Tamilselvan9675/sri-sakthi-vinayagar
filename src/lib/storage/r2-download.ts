import { GetObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getR2StorageConfig } from "./r2";

type R2File = {
  filename?: string | null;
  prefix?: string | null;
  _objectKey?: string | null;
};

let client: S3Client | null = null;

function getClient() {
  const config = getR2StorageConfig();
  if (!config.enabled || !config.bucket || !config.endpoint || !config.accessKeyId || !config.secretAccessKey) {
    return null;
  }

  if (!client) {
    client = new S3Client({
      region: "auto",
      endpoint: config.endpoint,
      forcePathStyle: true,
      credentials: {
        accessKeyId: config.accessKeyId,
        secretAccessKey: config.secretAccessKey,
      },
    });
  }

  return { bucket: config.bucket, client };
}

function safePart(value: string | null | undefined) {
  return value
    ?.split("/")
    .filter((part) => part && part !== "." && part !== "..")
    .join("/");
}

/**
 * Reads an upload directly from R2. This is required on serverless hosts where
 * Payload's local upload directory is not durable. The second key supports
 * files moved by the legacy R2 migration script.
 */
export async function readR2File(file: R2File): Promise<Buffer | null> {
  const storage = getClient();
  const filename = safePart(file.filename);
  const prefix = safePart(file.prefix);
  const objectKey = safePart(file._objectKey);
  if (!storage || !filename) return null;

  const keys = [
    [prefix, filename].filter(Boolean).join("/"),
    [prefix, objectKey, filename].filter(Boolean).join("/"),
  ].filter((key, index, keys) => key && keys.indexOf(key) === index);

  for (const key of keys) {
    try {
      const object = await storage.client.send(new GetObjectCommand({ Bucket: storage.bucket, Key: key }));
      if (object.Body) return Buffer.from(await object.Body.transformToByteArray());
    } catch (error) {
      const status = (error as { $metadata?: { httpStatusCode?: number } }).$metadata?.httpStatusCode;
      if (status !== 404) {
        console.warn(`[r2] Could not read private upload "${key}".`, error);
        return null;
      }
    }
  }

  return null;
}
