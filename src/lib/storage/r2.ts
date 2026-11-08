type Environment = Record<string, string | undefined>;

export type R2StorageConfig = {
  accessKeyId?: string;
  accountId?: string;
  bucket?: string;
  enabled: boolean;
  endpoint?: string;
  missing: string[];
  publicUrl?: string;
  secretAccessKey?: string;
};

function readSetting(value: string | undefined): string | undefined {
  const trimmed = value?.trim();
  return trimmed || undefined;
}

function normalizeHttpsUrl(name: string, value: string | undefined): string | undefined {
  const rawUrl = readSetting(value);
  if (!rawUrl) return undefined;

  let url: URL;
  try {
    url = new URL(rawUrl);
  } catch {
    throw new Error(`${name} must be a valid HTTPS URL.`);
  }

  if (url.protocol !== "https:" || url.username || url.password || url.search || url.hash) {
    throw new Error(`${name} must be an HTTPS URL without credentials, a query string, or a hash.`);
  }

  return url.toString().replace(/\/+$/, "");
}

/**
 * Reads the server-only R2 configuration shared by Payload, Next image config,
 * and the one-time local-upload migration scripts.
 */
export function getR2StorageConfig(env: Environment = process.env): R2StorageConfig {
  const accountId = readSetting(env.R2_ACCOUNT_ID);
  const accessKeyId = readSetting(env.R2_ACCESS_KEY_ID);
  const secretAccessKey = readSetting(env.R2_SECRET_ACCESS_KEY);
  const bucket = readSetting(env.R2_BUCKET);
  const endpoint = normalizeHttpsUrl(
    "R2_ENDPOINT",
    env.R2_ENDPOINT ?? (accountId ? `https://${accountId}.r2.cloudflarestorage.com` : undefined),
  );
  const publicUrl = normalizeHttpsUrl("R2_PUBLIC_URL", env.R2_PUBLIC_URL);
  const required = [
    ["R2_ACCOUNT_ID", accountId],
    ["R2_ACCESS_KEY_ID", accessKeyId],
    ["R2_SECRET_ACCESS_KEY", secretAccessKey],
    ["R2_BUCKET", bucket],
  ] as const;
  const missing = required.filter(([, value]) => !value).map(([name]) => name);

  return {
    accountId,
    accessKeyId,
    bucket,
    enabled: missing.length === 0,
    endpoint,
    missing,
    publicUrl,
    secretAccessKey,
  };
}
