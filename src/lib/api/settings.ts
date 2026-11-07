import { db } from "@/lib/db";
import { TempleSettings } from "@/generated/prisma/client";
import { getCmsSettings } from "@/lib/cms/content";

/**
 * Retrieves the global temple settings.
 *
 * Source of truth is the Payload CMS (`temple-settings`). If the CMS has no
 * record yet (or is unreachable) we fall back to the legacy Prisma record so
 * the site keeps working during the migration.
 */
export async function getTempleSettings(): Promise<TempleSettings | null> {
  let legacy: TempleSettings | null = null;
  try {
    legacy = await db.templeSettings.findFirst();
  } catch (error) {
    console.warn("Failed to fetch legacy temple settings:", error);
  }

  const cms = await getCmsSettings();
  if (!cms.ok || !cms.data) return legacy;

  const { templeNameEn, templeNameTa, addressEn, addressTa, phone, whatsapp, email, latitude, longitude, upiId, qrCodeUrl, logoUrl } = cms.data;
  const now = new Date();
  return {
    id: legacy?.id ?? "cms",
    primarySettings: legacy?.primarySettings ?? null,
    createdAt: legacy?.createdAt ?? now,
    updatedAt: now,
    templeNameEn: templeNameEn || legacy?.templeNameEn || "",
    templeNameTa: templeNameTa || legacy?.templeNameTa || "",
    addressEn: addressEn ?? legacy?.addressEn ?? null,
    addressTa: addressTa ?? legacy?.addressTa ?? null,
    phone: phone ?? legacy?.phone ?? null,
    whatsapp: whatsapp ?? legacy?.whatsapp ?? null,
    email: email ?? legacy?.email ?? null,
    latitude: latitude ?? legacy?.latitude ?? null,
    longitude: longitude ?? legacy?.longitude ?? null,
    upiId: upiId ?? legacy?.upiId ?? null,
    qrCodeUrl: qrCodeUrl ?? legacy?.qrCodeUrl ?? null,
    logoUrl: logoUrl ?? legacy?.logoUrl ?? null,
  };
}
