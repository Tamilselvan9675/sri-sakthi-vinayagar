import { getPayload, type Payload } from "payload";
import config from "@payload-config";

/**
 * Server-only Payload Local API client.
 * Never import this from a client component: it runs with direct DB access.
 */
let cached: Promise<Payload> | null = null;

export function getPayloadClient(): Promise<Payload> {
  if (!cached) {
    cached = getPayload({ config }).catch((error) => {
      cached = null; // allow retry on next request
      throw error;
    });
  }
  return cached;
}
