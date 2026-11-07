/**
 * CMS data layer for the public website (server-side only).
 *
 * Uses Payload's Local API. Everything returned here is a plain, serialisable
 * object shaped like the data the existing UI components already consume, so
 * the website design and components stay untouched.
 *
 * - Both languages are fetched at once (`locale: "all"`) so the existing
 *   client-side en/ta switching keeps working.
 * - Anonymous visitors only get published documents; `draft: true` (Next.js
 *   draft mode / CMS preview) includes drafts.
 * - Finance collections (donors, expenses) are read server-side and only
 *   public-safe fields are returned.
 * - Every function is fail-safe: it returns `{ ok: false }` instead of
 *   throwing so pages can show an error state.
 */
import type { Where } from "payload";
import type {
  Donor,
  Event,
  Expense,
  FestivalYear,
  Gallery,
  Media,
  Page,
  TempleSetting,
  Video,
  Winner,
} from "@/payload-types";
import { getPayloadClient } from "./payload";

export type CmsResult<T> = { ok: true; data: T } | { ok: false; data: T; error: string };

type Localized<T> = T | { en?: T | null; ta?: T | null } | null | undefined;

const ok = <T>(data: T): CmsResult<T> => ({ ok: true, data });
const fail = <T>(data: T, error: unknown): CmsResult<T> => ({
  ok: false,
  data,
  error: error instanceof Error ? error.message : String(error),
});

/** Resolve a `locale: "all"` localized value into { en, ta } with en fallback. */
function loc(value: Localized<string>): { en: string; ta: string } {
  if (value && typeof value === "object") {
    const en = value.en ?? "";
    return { en, ta: value.ta || en };
  }
  const text = (value as string | null | undefined) ?? "";
  return { en: text, ta: text };
}

function mediaUrl(media: number | Media | null | undefined): string | null {
  if (!media || typeof media === "number") return null;
  return media.sizes?.card?.url || media.url || null;
}

function mediaFullUrl(media: number | Media | null | undefined): string | null {
  if (!media || typeof media === "number") return null;
  return media.url || null;
}

function yearOf(rel: number | FestivalYear | null | undefined): number | null {
  return rel && typeof rel !== "number" ? rel.year : null;
}

const publishedOnly = (draft?: boolean): Where =>
  draft ? {} : { _status: { equals: "published" } };

type Opts = { draft?: boolean };

/* -------------------------------------------------------------------------- */
/* Festival years                                                             */
/* -------------------------------------------------------------------------- */

export type CmsYear = { id: string; year: number; titleEn: string; titleTa: string };

export async function getCmsFestivalYears(opts: Opts = {}): Promise<CmsResult<CmsYear[]>> {
  try {
    const payload = await getPayloadClient();
    const res = await payload.find({
      collection: "festival-years",
      locale: "all",
      sort: "-year",
      limit: 100,
      depth: 0,
      pagination: false,
      where: publishedOnly(opts.draft),
    });
    return ok(
      res.docs.map((d) => {
        const t = loc(d.title as Localized<string>);
        return { id: String(d.id), year: d.year, titleEn: t.en, titleTa: t.ta };
      }),
    );
  } catch (error) {
    return fail([], error);
  }
}

/* -------------------------------------------------------------------------- */
/* Winners                                                                    */
/* -------------------------------------------------------------------------- */

export type CmsWinner = {
  id: string;
  name: string;
  categoryEn: string;
  categoryTa: string;
  position: string;
  prizeEn: string | null;
  prizeTa: string | null;
  descriptionEn: string;
  descriptionTa: string;
  photoUrl: string | null;
  festivalYear: { year: number };
  eventId: null;
  event: null;
};

const POSITION_LABEL: Record<string, string> = {
  "1": "1st",
  "2": "2nd",
  "3": "3rd",
  special: "Special",
};

export async function getCmsWinners(opts: Opts = {}): Promise<CmsResult<CmsWinner[]>> {
  try {
    const payload = await getPayloadClient();
    const res = await payload.find({
      collection: "winners",
      locale: "all",
      limit: 500,
      depth: 2,
      pagination: false,
      draft: opts.draft,
      where: publishedOnly(opts.draft),
    });
    const docs = res.docs as Winner[];
    const list = docs
      .map((d): CmsWinner | null => {
        const year = yearOf(d.festivalYear as number | FestivalYear);
        if (year === null) return null;
        const game = loc(d.gameName as Localized<string>);
        const prize = loc(d.prizeDetails as Localized<string>);
        const desc = loc(d.description as Localized<string>);
        return {
          id: String(d.id),
          name: d.winnerName,
          categoryEn: game.en,
          categoryTa: game.ta,
          position: POSITION_LABEL[d.prizePosition] ?? d.prizePosition,
          prizeEn: prize.en || null,
          prizeTa: prize.ta || null,
          descriptionEn: desc.en,
          descriptionTa: desc.ta,
          photoUrl: mediaFullUrl(d.photo as number | Media | null),
          festivalYear: { year },
          eventId: null,
          event: null,
        };
      })
      .filter((w): w is CmsWinner => w !== null)
      .sort((a, b) => b.festivalYear.year - a.festivalYear.year);
    return ok(list);
  } catch (error) {
    return fail([], error);
  }
}

/* -------------------------------------------------------------------------- */
/* Gallery                                                                    */
/* -------------------------------------------------------------------------- */

export type CmsGalleryItem = {
  id: string;
  year: number;
  category: string; // English label, used by the category filter
  titleEn: string;
  titleTa: string;
  descEn: string;
  descTa: string;
  imageUrl: string;
};

const GALLERY_LABEL: Record<string, string> = {
  "first-day": "First Day",
  "last-day": "Last Day",
  games: "Games",
  "vinayagar-statue": "Vinayagar Statue",
};
export const GALLERY_CATEGORY_LABELS = Object.values(GALLERY_LABEL);

export async function getCmsGallery(opts: Opts = {}): Promise<CmsResult<CmsGalleryItem[]>> {
  try {
    const payload = await getPayloadClient();
    const res = await payload.find({
      collection: "gallery",
      locale: "all",
      limit: 500,
      depth: 2,
      pagination: false,
      draft: opts.draft,
      where: publishedOnly(opts.draft),
    });
    const items: CmsGalleryItem[] = [];
    for (const album of res.docs as Gallery[]) {
      const year = yearOf(album.festivalYear as number | FestivalYear);
      if (year === null) continue;
      const albumTitle = loc(album.title as Localized<string>);
      (album.photos ?? []).forEach((photo, index) => {
        const url = mediaFullUrl(photo.image as number | Media);
        if (!url) return;
        const caption = loc(photo.caption as Localized<string>);
        items.push({
          id: `${album.id}-${photo.id ?? index}`,
          year,
          category: GALLERY_LABEL[album.category] ?? album.category,
          titleEn: albumTitle.en,
          titleTa: albumTitle.ta,
          descEn: caption.en,
          descTa: caption.ta,
          imageUrl: url,
        });
      });
    }
    return ok(items);
  } catch (error) {
    return fail([], error);
  }
}

/* -------------------------------------------------------------------------- */
/* Videos                                                                     */
/* -------------------------------------------------------------------------- */

export type CmsVideoItem = {
  id: string;
  year: number;
  category: string;
  youtubeId: string;
  titleEn: string;
  titleTa: string;
  descEn: string;
  descTa: string;
  thumbnailUrl: string;
};

const VIDEO_LABEL: Record<string, string> = {
  festival: "Festival",
  pooja: "Pooja",
  "first-day": "First Day",
  "last-day": "Last Day",
  games: "Games",
  vinayagar: "Vinayagar",
};
export const VIDEO_CATEGORY_LABELS = Object.values(VIDEO_LABEL);

export async function getCmsVideos(opts: Opts = {}): Promise<CmsResult<CmsVideoItem[]>> {
  try {
    const payload = await getPayloadClient();
    const res = await payload.find({
      collection: "videos",
      locale: "all",
      limit: 500,
      depth: 2,
      pagination: false,
      draft: opts.draft,
      where: publishedOnly(opts.draft),
    });
    const items: CmsVideoItem[] = [];
    for (const v of res.docs as Video[]) {
      const year = yearOf(v.festivalYear as number | FestivalYear);
      if (year === null || !v.youtubeId) continue;
      const title = loc(v.title as Localized<string>);
      const desc = loc(v.description as Localized<string>);
      items.push({
        id: String(v.id),
        year,
        category: VIDEO_LABEL[v.category] ?? v.category,
        youtubeId: v.youtubeId,
        titleEn: title.en,
        titleTa: title.ta,
        descEn: desc.en,
        descTa: desc.ta,
        thumbnailUrl:
          mediaUrl(v.thumbnail as number | Media | null) ||
          `https://img.youtube.com/vi/${v.youtubeId}/maxresdefault.jpg`,
      });
    }
    return ok(items);
  } catch (error) {
    return fail([], error);
  }
}

/* -------------------------------------------------------------------------- */
/* Events                                                                     */
/* -------------------------------------------------------------------------- */

export type CmsEvent = {
  id: string;
  year: number;
  date: string;
  time: string | null;
  titleEn: string;
  titleTa: string;
  descriptionEn: string;
  descriptionTa: string;
};

export async function getCmsEvents(opts: Opts & { year?: number } = {}): Promise<CmsResult<CmsEvent[]>> {
  try {
    const payload = await getPayloadClient();
    const and: Where[] = [publishedOnly(opts.draft)];
    if (opts.year) and.push({ "festivalYear.year": { equals: opts.year } });
    const res = await payload.find({
      collection: "events",
      locale: "all",
      sort: "date",
      limit: 500,
      depth: 1,
      pagination: false,
      draft: opts.draft,
      where: { and },
    });
    const list: CmsEvent[] = [];
    for (const e of res.docs as Event[]) {
      const year = yearOf(e.festivalYear as number | FestivalYear);
      if (year === null) continue;
      const name = loc(e.name as Localized<string>);
      const desc = loc(e.description as Localized<string>);
      list.push({
        id: String(e.id),
        year,
        date: e.date,
        time: e.time ?? null,
        titleEn: name.en,
        titleTa: name.ta,
        descriptionEn: desc.en,
        descriptionTa: desc.ta,
      });
    }
    return ok(list);
  } catch (error) {
    return fail([], error);
  }
}

/* -------------------------------------------------------------------------- */
/* Temple settings                                                            */
/* -------------------------------------------------------------------------- */

export type CmsSettings = {
  templeNameEn: string;
  templeNameTa: string;
  addressEn: string | null;
  addressTa: string | null;
  phone: string | null;
  whatsapp: string | null;
  email: string | null;
  latitude: number | null;
  longitude: number | null;
  upiId: string | null;
  qrCodeUrl: string | null;
  logoUrl: string | null;
};

export async function getCmsSettings(): Promise<CmsResult<CmsSettings | null>> {
  try {
    const payload = await getPayloadClient();
    const res = await payload.find({
      collection: "temple-settings",
      locale: "all",
      limit: 1,
      depth: 1,
    });
    const s = res.docs[0] as TempleSetting | undefined;
    if (!s) return ok(null);
    const name = loc(s.templeName as Localized<string>);
    const address = loc(s.address as Localized<string>);
    return ok({
      templeNameEn: name.en,
      templeNameTa: name.ta,
      addressEn: address.en || null,
      addressTa: address.ta || null,
      phone: s.phone ?? null,
      whatsapp: s.whatsapp ?? null,
      email: s.email ?? null,
      latitude: s.latitude ?? null,
      longitude: s.longitude ?? null,
      upiId: s.upiId ?? null,
      qrCodeUrl: mediaFullUrl(s.upiQrCode as number | Media | null),
      logoUrl: mediaFullUrl(s.logo as number | Media | null),
    });
  } catch (error) {
    return fail(null, error);
  }
}

/* -------------------------------------------------------------------------- */
/* Finance (server-side only, public-safe fields)                             */
/* -------------------------------------------------------------------------- */

export type CmsDonor = {
  id: string;
  year: number;
  name: string;
  amount: number;
  descriptionEn: string;
  descriptionTa: string;
};

export async function getCmsDonors(year?: number): Promise<CmsResult<CmsDonor[]>> {
  try {
    const payload = await getPayloadClient();
    const res = await payload.find({
      collection: "donors",
      locale: "all",
      sort: "-amount",
      limit: 1000,
      depth: 1,
      pagination: false,
      where: year ? { "festivalYear.year": { equals: year } } : {},
    });
    const list: CmsDonor[] = [];
    for (const d of res.docs as Donor[]) {
      const y = yearOf(d.festivalYear as number | FestivalYear);
      if (y === null) continue;
      const desc = loc(d.description as Localized<string>);
      list.push({
        id: String(d.id),
        year: y,
        name: d.donorName,
        amount: d.amount,
        descriptionEn: desc.en,
        descriptionTa: desc.ta,
      });
    }
    return ok(list);
  } catch (error) {
    return fail([], error);
  }
}

export type CmsExpense = {
  id: string;
  year: number;
  categoryEn: string;
  categoryTa: string;
  amount: number;
  date: string;
  descriptionEn: string;
  descriptionTa: string;
  type: "cash" | "in-kind";
};

/** `responsiblePerson` is deliberately NOT exposed on the public site. */
export async function getCmsExpenses(year?: number): Promise<CmsResult<CmsExpense[]>> {
  try {
    const payload = await getPayloadClient();
    const res = await payload.find({
      collection: "expenses",
      locale: "all",
      sort: "-date",
      limit: 2000,
      depth: 1,
      pagination: false,
      where: year ? { "festivalYear.year": { equals: year } } : {},
    });
    const list: CmsExpense[] = [];
    for (const e of res.docs as Expense[]) {
      const y = yearOf(e.festivalYear as number | FestivalYear);
      if (y === null) continue;
      const cat = loc(e.category as Localized<string>);
      const desc = loc(e.description as Localized<string>);
      list.push({
        id: String(e.id),
        year: y,
        categoryEn: cat.en,
        categoryTa: cat.ta,
        amount: e.amount,
        date: e.date,
        descriptionEn: desc.en,
        descriptionTa: desc.ta,
        type: e.type,
      });
    }
    return ok(list);
  } catch (error) {
    return fail([], error);
  }
}

/* -------------------------------------------------------------------------- */
/* Pages (editable website text: home, about, ...)                            */
/* -------------------------------------------------------------------------- */

export type CmsPage = {
  heading: string | null;
  description: string | null;
  heroImageUrl: string | null;
  blocks: NonNullable<Page["blocks"]>;
};

/**
 * Returns the published page for `slug` in the requested language (falls back
 * to English), or null when the CMS has none / is unreachable, in which case
 * callers keep their built-in default text.
 */
export async function getCmsPage(slug: string, locale: string, opts: Opts = {}): Promise<CmsPage | null> {
  try {
    const payload = await getPayloadClient();
    const res = await payload.find({
      collection: "pages",
      locale: locale === "ta" ? "ta" : "en",
      fallbackLocale: "en",
      limit: 1,
      depth: 1,
      draft: opts.draft,
      where: { and: [{ slug: { equals: slug } }, publishedOnly(opts.draft)] },
    });
    const page = res.docs[0] as Page | undefined;
    if (!page) return null;
    return {
      heading: page.heading || null,
      description: page.description || null,
      heroImageUrl: mediaFullUrl(page.heroImage as number | Media | null),
      blocks: page.blocks ?? [],
    };
  } catch {
    return null;
  }
}

/* -------------------------------------------------------------------------- */
/* Finance snapshot for the public donors / expenses pages                    */
/* -------------------------------------------------------------------------- */

export type CmsDonorRow = {
  id: number;
  donorNameTa: string;
  donorNameEn: string;
  detailsTa: string;
  detailsEn: string;
  amount: number | null;
};

export type CmsExpenseRow = {
  id: number;
  categoryTa: string;
  categoryEn: string;
  detailsTa: string;
  detailsEn: string;
  responsibleTa: string;
  responsibleEn: string;
  amount: number | null;
};

export type CmsFinance = { year: number; donors: CmsDonorRow[]; expenses: CmsExpenseRow[] };

/**
 * Latest festival year that has donor or expense records, shaped for the
 * existing donors / expenses UI. Returns null when the CMS has no finance data
 * (the pages then keep showing their built-in records).
 *
 * `responsiblePerson` stays private in the CMS and is intentionally left blank.
 */
export async function getCmsFinance(): Promise<CmsFinance | null> {
  const [donors, expenses] = await Promise.all([getCmsDonors(), getCmsExpenses()]);
  if (!donors.ok || !expenses.ok) return null;
  const years = [...donors.data.map((d) => d.year), ...expenses.data.map((e) => e.year)];
  if (years.length === 0) return null;
  const year = Math.max(...years);

  return {
    year,
    donors: donors.data
      .filter((d) => d.year === year)
      .map((d, i) => ({
        id: i + 1,
        donorNameTa: d.name,
        donorNameEn: d.name,
        detailsTa: d.descriptionTa,
        detailsEn: d.descriptionEn,
        amount: d.amount,
      })),
    expenses: expenses.data
      .filter((e) => e.year === year)
      .map((e, i) => ({
        id: i + 1,
        categoryTa: e.categoryTa,
        categoryEn: e.categoryEn,
        detailsTa: e.descriptionTa,
        detailsEn: e.descriptionEn,
        responsibleTa: "",
        responsibleEn: "",
        amount: e.type === "in-kind" ? null : e.amount,
      })),
  };
}
