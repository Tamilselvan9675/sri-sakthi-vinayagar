import type { NextConfig } from "next";
import { withPayload } from "@payloadcms/next/withPayload";
import { getR2StorageConfig } from "./src/lib/storage/r2";

const { publicUrl: r2PublicUrl } = getR2StorageConfig();

type RemotePattern = NonNullable<NonNullable<NextConfig["images"]>["remotePatterns"]>[number];

const remotePatterns: RemotePattern[] = [
  // Permit Cloudflare R2 public development domains (*.r2.dev)
  {
    protocol: "https",
    hostname: "*.r2.dev",
    pathname: "/**",
  },
];

if (r2PublicUrl) {
  try {
    const parsed = new URL(r2PublicUrl);
    remotePatterns.push({
      protocol: (parsed.protocol.replace(":", "") || "https") as "http" | "https",
      hostname: parsed.hostname,
      pathname: "/**",
    });
  } catch {
    // Ignore invalid URLs
  }
}

const nextConfig: NextConfig = {
  images: {
    remotePatterns,
  },
};

export default withPayload(nextConfig);
