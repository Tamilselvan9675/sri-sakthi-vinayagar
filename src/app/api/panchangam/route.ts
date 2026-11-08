import { NextRequest, NextResponse } from "next/server";
import { fetchPanchangamData } from "@/lib/api/prokerala";

export const runtime = "nodejs";

const DATE_REGEX = /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/;

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const dateParam = searchParams.get("date")?.trim();
  const locale = searchParams.get("locale")?.trim() === "ta" ? "ta" : "en";

  if (!dateParam || !DATE_REGEX.test(dateParam)) {
    return NextResponse.json(
      { ok: false, error: "Valid date parameter required (YYYY-MM-DD)" },
      { status: 400 },
    );
  }

  const result = await fetchPanchangamData(dateParam, locale);
  if (!result.ok) {
    return NextResponse.json({ ok: false, error: result.error }, { status: 502 });
  }

  return NextResponse.json(
    { ok: true, data: result.data },
    {
      headers: {
        "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=604800",
      },
    },
  );
}
