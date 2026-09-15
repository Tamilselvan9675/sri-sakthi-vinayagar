import { db } from "@/lib/db";
import { TempleSettings } from "@/generated/prisma/client";

/**
 * Retrieves the global temple settings.
 * Since it's a singleton, it fetches the first record.
 */
export async function getTempleSettings(): Promise<TempleSettings | null> {
  try {
    const settings = await db.templeSettings.findFirst();
    return settings;
  } catch (error) {
    console.warn("Failed to fetch temple settings:", error);
    return null;
  }
}
