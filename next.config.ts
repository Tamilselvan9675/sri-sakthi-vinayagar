import type { NextConfig } from "next";
import { withPayload } from "@payloadcms/next/withPayload";
import { getR2StorageConfig } from "./src/lib/storage/r2";

const { publicUrl: r2PublicUrl } = getR2StorageConfig();

const nextConfig: NextConfig = {
  images: {
    // Permit only objects beneath the configured public R2 base URL. The
    // Payload API continues to serve media when R2_PUBLIC_URL is omitted.
    remotePatterns: r2PublicUrl ? [new URL(`${r2PublicUrl}/**`)] : [],
  },
};

export default withPayload(nextConfig);
