/**
 * DUMMY test content for the CMS – for local testing only.
 *
 *   npm run payload:seed
 *
 * Everything created here is clearly labelled "[DUMMY]" (English) /
 * "[டம்மி]" (Tamil) so it is easy to find and delete in the admin panel.
 * Existing data is never modified or deleted; the script refuses to run
 * if dummy content already exists, and refuses to run in production
 * unless SEED_DUMMY=true is set explicitly.
 */
import sharp from "sharp";
import { getPayload } from "payload";
import config from "../payload.config.ts";

if (process.env.NODE_ENV === "production" && process.env.SEED_DUMMY !== "true") {
  console.error("Refusing to seed dummy data in production (set SEED_DUMMY=true to override).");
  process.exit(1);
}

const payload = await getPayload({ config });
const D = "[DUMMY] ";
const DT = "[டம்மி] ";

const already = await payload.count({ collection: "festival-years", where: { year: { equals: 2099 } } });
if (already.totalDocs > 0) {
  console.log("Dummy content already present (year 2099). Nothing to do.");
  process.exit(0);
}

/** Create in English then add Tamil text for localized fields. */
async function make(collection: string, en: Record<string, unknown>, ta: Record<string, unknown> = {}) {
  const doc = (await payload.create({ collection: collection as never, data: en as never, locale: "en", draft: false })) as { id: number };
  if (Object.keys(ta).length) {
    await payload.update({ collection: collection as never, id: doc.id, data: ta as never, locale: "ta", draft: false });
  }
  return doc.id;
}

async function placeholder(label: string, color: string) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="900"><rect width="100%" height="100%" fill="${color}"/><text x="50%" y="50%" font-size="64" font-family="Arial" fill="#fff" text-anchor="middle">DUMMY – ${label}</text></svg>`;
  const data = await sharp(Buffer.from(svg)).png().toBuffer();
  return make("media", { alt: `${D}${label}` }, { alt: `${DT}${label}` }).then(async (id) => id, async () => 0).then(() => data);
}
void placeholder; // (media upload helper below uses payload.create with a file)

async function uploadPlaceholder(label: string, color: string) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="900"><rect width="100%" height="100%" fill="${color}"/><text x="50%" y="50%" font-size="64" font-family="Arial" fill="#fff" text-anchor="middle">DUMMY - ${label}</text></svg>`;
  const buffer = await sharp(Buffer.from(svg)).png().toBuffer();
  const doc = await payload.create({
    collection: "media",
    data: { alt: `${D}${label}` },
    file: { data: buffer, mimetype: "image/png", name: `dummy-${label.toLowerCase().replace(/\s+/g, "-")}.png`, size: buffer.length },
    locale: "en",
  });
  await payload.update({ collection: "media", id: doc.id, data: { alt: `${DT}${label}` }, locale: "ta" });
  return doc.id;
}

// Years
const y2099 = await make("festival-years", { year: 2099, title: `${D}Vinayagar Chaturthi 2099`, startDate: "2099-09-05T00:00:00.000Z", endDate: "2099-09-09T00:00:00.000Z", description: "Dummy festival used only for CMS testing.", _status: "published" }, { title: `${DT}விநாயகர் சதுர்த்தி 2099`, description: "CMS சோதனைக்காக மட்டுமே." });
const y2098 = await make("festival-years", { year: 2098, title: `${D}Vinayagar Chaturthi 2098`, startDate: "2098-09-05T00:00:00.000Z", endDate: "2098-09-09T00:00:00.000Z", _status: "published" }, { title: `${DT}விநாயகர் சதுர்த்தி 2098` });

// Events
await make("events", { festivalYear: y2099, date: "2099-09-05T00:00:00.000Z", time: "6:00 PM", name: `${D}Opening Pooja`, description: "Dummy event.", _status: "published" }, { name: `${DT}தொடக்க பூஜை`, description: "டம்மி நிகழ்வு." });
await make("events", { festivalYear: y2099, date: "2099-09-07T00:00:00.000Z", time: "5:00 PM", name: `${D}Kolam Competition`, _status: "published" }, { name: `${DT}கோலப் போட்டி` });

// Media
const imgStatue = await uploadPlaceholder("Statue", "#8b1818");
const imgGames = await uploadPlaceholder("Games", "#b45309");
const imgFirst = await uploadPlaceholder("First Day", "#7c2d12");
const imgWinner = await uploadPlaceholder("Winner", "#14532d");

// Gallery
await make("gallery", { festivalYear: y2099, title: `${D}Vinayagar Statue`, category: "vinayagar-statue", photos: [{ image: imgStatue }], _status: "published" }, { title: `${DT}விநாயகர் சிலை` });
await make("gallery", { festivalYear: y2099, title: `${D}Games`, category: "games", photos: [{ image: imgGames }], _status: "published" }, { title: `${DT}விளையாட்டுகள்` });
await make("gallery", { festivalYear: y2098, title: `${D}First Day`, category: "first-day", photos: [{ image: imgFirst }], _status: "published" }, { title: `${DT}முதல் நாள்` });

// Winners
await make("winners", { festivalYear: y2099, winnerName: "Dummy Winner", photo: imgWinner, gameName: `${D}Kolam`, prizePosition: "1", prizeDetails: "Dummy prize", description: "Dummy winner.", _status: "published" }, { gameName: `${DT}கோலம்`, prizeDetails: "டம்மி பரிசு" });

// Videos
await make("videos", { festivalYear: y2099, title: `${D}Festival Highlights`, youtubeUrl: "https://www.youtube.com/watch?v=aqz-KE-bpKQ", category: "festival", _status: "published" }, { title: `${DT}திருவிழா சிறப்பம்சங்கள்` });

// Finance
await make("donors", { festivalYear: y2099, donorName: `${D}Test Donor`, amount: 1001, description: "Dummy donation" }, { description: "டம்மி நன்கொடை" });
await make("expenses", { festivalYear: y2099, category: `${D}Decoration`, amount: 2500, date: "2099-09-04T00:00:00.000Z", description: "Dummy expense", responsiblePerson: "Test Person", type: "cash" }, { category: `${DT}அலங்காரம்`, description: "டம்மி செலவு" });

// Settings: only if none exist
if ((await payload.count({ collection: "temple-settings" })).totalDocs === 0) {
  await make("temple-settings", { templeName: `${D}Sri Sakthi Vinayagar Temple`, address: "Kadambadi, Mamallapuram", phone: "0000000000", latitude: 12.597478, longitude: 80.147670 }, { templeName: `${DT}ஸ்ரீ சக்தி விநாயகர் கோயில்` });
}

console.log("Dummy content created (years 2098/2099). Delete anything marked [DUMMY] when you are done testing.");
process.exit(0);
