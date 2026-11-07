import { draftMode, headers } from "next/headers";
import { redirect } from "next/navigation";
import { getPayloadClient } from "@/lib/cms/payload";

/**
 * CMS preview entry point.
 * Only a logged-in CMS user (valid Payload session cookie) can enable Next.js
 * draft mode, so drafts are never exposed to the public.
 *
 *   /api/preview?path=/en/gallery   -> enable draft mode, redirect to path
 *   /api/preview?exit=1&path=/en    -> disable draft mode
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const path = searchParams.get("path") || "/";

  // Only allow same-site relative paths (prevents open redirects).
  if (!path.startsWith("/") || path.startsWith("//")) {
    return new Response("Invalid path", { status: 400 });
  }

  const draft = await draftMode();

  if (searchParams.get("exit")) {
    draft.disable();
    redirect(path);
  }

  const payload = await getPayloadClient();
  const { user } = await payload.auth({ headers: await headers() });
  if (!user) {
    return new Response("You must be logged in to the CMS to preview drafts.", { status: 403 });
  }

  draft.enable();
  redirect(path);
}
