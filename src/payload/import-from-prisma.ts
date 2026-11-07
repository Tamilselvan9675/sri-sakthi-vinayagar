/**
 * One-time, SAFE import of existing Prisma data into Payload.
 *
 *   npm run payload:import
 *
 * - READ-ONLY on the Prisma tables (only SELECT statements are issued).
 * - Never deletes or overwrites anything. Re-running is safe: records carry a
 *   `legacyId`, and anything already imported is skipped.
 * - Gallery photos are NOT imported automatically (legacy rows only store
 *   external URLs, but the CMS needs real uploaded files) – re-upload via
 *   the admin panel. Winner photos are skipped for the same reason.
 *
 * Runs under Node's native TypeScript support, hence the explicit `.ts` import.
 */
import pg from "pg";
import { getPayload } from "payload";
import config from "../payload.config.ts";

const payload = await getPayload({ config });
const client = new pg.Client({ connectionString: process.env.DATABASE_URL });
await client.connect();

const stats: Record<string, { created: number; skipped: number }> = {};
const bump = (key: string, created: boolean) => {
  stats[key] ??= { created: 0, skipped: 0 };
  stats[key][created ? "created" : "skipped"]++;
};

const q = async <T = Record<string, unknown>>(sql: string): Promise<T[]> => {
  try {
    return (await client.query(sql)).rows as T[];
  } catch (error) {
    console.warn(`  (skipped query – ${(error as Error).message})`);
    return [];
  }
};

const exists = async (collection: string, field: string, value: string) =>
  (await payload.find({ collection: collection as never, where: { [field]: { equals: value } }, limit: 1, depth: 0, pagination: false })).docs[0];

const position = (p: string) => {
  const s = (p || "").toLowerCase();
  if (s.includes("1") || s.includes("first")) return "1";
  if (s.includes("2") || s.includes("second")) return "2";
  if (s.includes("3") || s.includes("third")) return "3";
  return "special";
};

/** Create with English, then add the Tamil translation of localized fields. */
async function createBilingual(collection: string, data: Record<string, unknown>, ta: Record<string, unknown>) {
  const doc = await payload.create({ collection: collection as never, data: data as never, locale: "en", draft: false });
  if (Object.keys(ta).length) {
    await payload.update({ collection: collection as never, id: (doc as { id: number }).id, data: ta as never, locale: "ta", draft: false });
  }
  return doc as { id: number };
}

/* ---------------------------------- years --------------------------------- */
type YearRow = { id: string; year: number; titleEn: string; titleTa: string; descriptionEn: string | null; descriptionTa: string | null; startDate: Date; endDate: Date };
const yearIdByLegacy = new Map<string, number>();
for (const y of await q<YearRow>(`SELECT * FROM "FestivalYear" ORDER BY year`)) {
  let doc = (await exists("festival-years", "year", String(y.year))) as { id: number } | undefined;
  bump("festival-years", !doc);
  if (!doc) {
    doc = await createBilingual(
      "festival-years",
      { year: y.year, title: y.titleEn, description: y.descriptionEn ?? undefined, startDate: y.startDate.toISOString(), endDate: y.endDate.toISOString(), _status: "published" },
      { title: y.titleTa, description: y.descriptionTa ?? undefined },
    );
  }
  yearIdByLegacy.set(y.id, doc.id);
}

/* --------------------------------- events --------------------------------- */
for (const e of await q<{ id: string; festivalYearId: string; date: Date; time: string | null; titleEn: string; titleTa: string; descriptionEn: string | null; descriptionTa: string | null }>(`SELECT * FROM "Event"`)) {
  const festivalYear = yearIdByLegacy.get(e.festivalYearId);
  const done = await exists("events", "legacyId", e.id);
  bump("events", !done);
  if (done || !festivalYear) continue;
  await createBilingual(
    "events",
    { legacyId: e.id, festivalYear, date: e.date.toISOString(), time: e.time ?? undefined, name: e.titleEn, description: e.descriptionEn ?? undefined, _status: "published" },
    { name: e.titleTa, description: e.descriptionTa ?? undefined },
  );
}

/* --------------------------------- winners -------------------------------- */
for (const w of await q<{ id: string; festivalYearId: string; name: string; categoryEn: string; categoryTa: string; position: string; prizeEn: string | null; prizeTa: string | null }>(`SELECT * FROM "Winner"`)) {
  const festivalYear = yearIdByLegacy.get(w.festivalYearId);
  const done = await exists("winners", "legacyId", w.id);
  bump("winners", !done);
  if (done || !festivalYear) continue;
  await createBilingual(
    "winners",
    { legacyId: w.id, festivalYear, winnerName: w.name, gameName: w.categoryEn, prizePosition: position(w.position), prizeDetails: w.prizeEn ?? undefined, _status: "published" },
    { gameName: w.categoryTa, prizeDetails: w.prizeTa ?? undefined },
  );
}

/* --------------------------------- videos --------------------------------- */
const ytId = (url: string) => url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/|live\/))([\w-]{11})/)?.[1] ?? (/^[\w-]{11}$/.test(url) ? url : "");
for (const v of await q<{ id: string; festivalYearId: string; titleEn: string; titleTa: string; descriptionEn: string | null; descriptionTa: string | null; videoUrl: string }>(`SELECT * FROM "Video"`)) {
  const festivalYear = yearIdByLegacy.get(v.festivalYearId);
  const done = await exists("videos", "legacyId", v.id);
  const id = ytId(v.videoUrl);
  bump("videos", !done && !!id);
  if (done || !festivalYear || !id) continue;
  await createBilingual(
    "videos",
    { legacyId: v.id, festivalYear, title: v.titleEn, youtubeUrl: v.videoUrl, category: "festival", description: v.descriptionEn ?? undefined, _status: "published" },
    { title: v.titleTa, description: v.descriptionTa ?? undefined },
  );
}

/* ------------------------- donations -> donors ---------------------------- */
for (const d of await q<{ id: string; festivalYearId: string | null; donorName: string | null; amount: string }>(`SELECT * FROM "Donation" WHERE status = 'COMPLETED' AND "donorName" IS NOT NULL`)) {
  const festivalYear = d.festivalYearId ? yearIdByLegacy.get(d.festivalYearId) : undefined;
  const done = await exists("donors", "legacyId", d.id);
  bump("donors", !done && !!festivalYear);
  if (done || !festivalYear) continue;
  await payload.create({ collection: "donors", data: { legacyId: d.id, festivalYear, donorName: d.donorName!, amount: Number(d.amount) }, locale: "en" });
}

/* -------------------------------- expenses -------------------------------- */
type ExpRow = { id: string; festivalYearId: string; descriptionEn: string; descriptionTa: string; amount: string; expenseDate: Date; categoryEn: string; categoryTa: string };
for (const e of await q<ExpRow>(`SELECT e.*, c."nameEn" AS "categoryEn", c."nameTa" AS "categoryTa" FROM "Expense" e JOIN "ExpenseCategory" c ON c.id = e."categoryId"`)) {
  const festivalYear = yearIdByLegacy.get(e.festivalYearId);
  const done = await exists("expenses", "legacyId", e.id);
  bump("expenses", !done && !!festivalYear);
  if (done || !festivalYear) continue;
  await createBilingual(
    "expenses",
    { legacyId: e.id, festivalYear, category: e.categoryEn, amount: Number(e.amount), date: e.expenseDate.toISOString(), description: e.descriptionEn, type: "cash" },
    { category: e.categoryTa, description: e.descriptionTa },
  );
}

/* ------------------------------ temple settings ---------------------------- */
const existingSettings = await payload.count({ collection: "temple-settings" });
if (existingSettings.totalDocs === 0) {
  const [s] = await q<{ templeNameEn: string; templeNameTa: string; addressEn: string | null; addressTa: string | null; phone: string | null; whatsapp: string | null; email: string | null; latitude: number | null; longitude: number | null; upiId: string | null }>(`SELECT * FROM "TempleSettings" LIMIT 1`);
  bump("temple-settings", !!s);
  if (s) {
    await createBilingual(
      "temple-settings",
      { templeName: s.templeNameEn, address: s.addressEn ?? undefined, phone: s.phone ?? undefined, whatsapp: s.whatsapp ?? undefined, email: s.email ?? undefined, latitude: s.latitude ?? undefined, longitude: s.longitude ?? undefined, upiId: s.upiId ?? undefined },
      { templeName: s.templeNameTa, address: s.addressTa ?? undefined },
    );
  }
} else {
  bump("temple-settings", false);
}

console.log("\nImport finished (created / already present):");
for (const [key, v] of Object.entries(stats)) console.log(`  ${key.padEnd(16)} ${v.created} / ${v.skipped}`);

await client.end();
process.exit(0);
