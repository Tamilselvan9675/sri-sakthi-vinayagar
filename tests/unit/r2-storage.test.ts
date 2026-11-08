import { describe, expect, it } from "vitest";
import { getR2StorageConfig } from "@/lib/storage/r2";

describe("getR2StorageConfig", () => {
  it("uses Cloudflare's standard S3 endpoint when all required settings are present", () => {
    const config = getR2StorageConfig({
      R2_ACCOUNT_ID: "account-id",
      R2_ACCESS_KEY_ID: "access-key",
      R2_SECRET_ACCESS_KEY: "secret-key",
      R2_BUCKET: "temple-media",
      R2_PUBLIC_URL: "https://media.sakthivinayagar.com/",
    });

    expect(config).toMatchObject({
      enabled: true,
      endpoint: "https://account-id.r2.cloudflarestorage.com",
      publicUrl: "https://media.sakthivinayagar.com",
    });
  });

  it("reports the missing credentials without enabling cloud storage", () => {
    const config = getR2StorageConfig({ R2_ACCOUNT_ID: "account-id" });

    expect(config.enabled).toBe(false);
    expect(config.missing).toEqual(["R2_ACCESS_KEY_ID", "R2_SECRET_ACCESS_KEY", "R2_BUCKET"]);
  });

  it("rejects public media URLs that are not safe HTTPS origins", () => {
    expect(() =>
      getR2StorageConfig({ R2_PUBLIC_URL: "http://media.sakthivinayagar.com" }),
    ).toThrow("R2_PUBLIC_URL must be an HTTPS URL");
  });
});
