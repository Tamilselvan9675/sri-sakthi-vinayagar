/**
 * Single source of truth for where uploads live inside the Cloudflare R2 bucket.
 *
 *   images            -> media/gallery
 *   videos            -> media/videos
 *   finance PDFs/XLSX -> financial-reports
 */
export const R2_FOLDERS = {
  images: "media/gallery",
  cms: "media/cms",
  videos: "media/videos",
  financialReports: "financial-reports",
} as const;

const FINANCE_COLLECTIONS = new Set(["expense-files", "donor-files"]);

/** Returns the R2 folder (the Payload `prefix`) for an upload. */
export function resolveStorageFolder(
  collectionSlug: string,
  mimeType?: string | null,
  context?: { folder?: string | null; filename?: string | null } | null
): string {
  if (FINANCE_COLLECTIONS.has(collectionSlug)) return R2_FOLDERS.financialReports;
  if (mimeType?.startsWith("video/")) return R2_FOLDERS.videos;
  if (
    context?.folder === "cms" ||
    context?.folder === "site" ||
    context?.filename?.toLowerCase().includes("logo")
  ) {
    return R2_FOLDERS.cms;
  }
  return R2_FOLDERS.images;
}
