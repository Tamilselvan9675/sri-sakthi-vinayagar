/**
 * Single source of truth for where uploads live inside the Cloudflare R2 bucket.
 *
 *   images            -> media/gallery
 *   videos            -> media/videos
 *   finance PDFs/XLSX -> financial-reports
 */
export const R2_FOLDERS = {
  images: "media/gallery",
  videos: "media/videos",
  financialReports: "financial-reports",
} as const;

const FINANCE_COLLECTIONS = new Set(["expense-files", "donor-files"]);

/** Returns the R2 folder (the Payload `prefix`) for an upload. */
export function resolveStorageFolder(collectionSlug: string, mimeType?: string | null): string {
  if (FINANCE_COLLECTIONS.has(collectionSlug)) return R2_FOLDERS.financialReports;
  if (mimeType?.startsWith("video/")) return R2_FOLDERS.videos;
  return R2_FOLDERS.images;
}
