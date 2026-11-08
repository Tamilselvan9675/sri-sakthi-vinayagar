import { TEMPLE_COORDINATES } from "@/lib/constants/social";

export interface PanchangamObservance {
  id: string;
  title: string;
  subtitle: string;
}

export interface PanchangamData {
  date: string;
  tamilMonth: string;
  tamilDay: number;
  tamilDateFormatted: string;
  weekday: string;
  tithi: string;
  nakshatra: string;
  rahuKalam: string;
  yamagandam: string;
  sunrise: string;
  sunset: string;
  observances: PanchangamObservance[];
}

interface ProkeralaPeriodItem {
  start: string;
  end: string;
}

interface ProkeralaTithiItem {
  id: number;
  name: string;
  paksha: string;
  start: string;
  end: string;
}

interface ProkeralaNakshatraItem {
  id: number;
  name: string;
  start: string;
  end: string;
}

interface ProkeralaKalamItem {
  id: number;
  name: string;
  type: string;
  period: ProkeralaPeriodItem[];
}

interface ProkeralaAdvancedPanchangResponse {
  status: string;
  data?: {
    vaara?: string;
    sunrise?: string;
    sunset?: string;
    tithi?: ProkeralaTithiItem[];
    nakshatra?: ProkeralaNakshatraItem[];
    auspicious_period?: ProkeralaKalamItem[];
    inauspicious_period?: ProkeralaKalamItem[];
  };
  errors?: Array<{ title?: string; detail?: string }>;
}

const PROKERALA_TOKEN_URL = "https://api.prokerala.com/token";
const PROKERALA_PANCHANG_URL = "https://api.prokerala.com/v2/astrology/panchang/advanced";

const TAMIL_MONTHS = [
  { en: "Chithirai", ta: "சித்திரை" },
  { en: "Vaikasi", ta: "வைகாசி" },
  { en: "Aani", ta: "ஆனி" },
  { en: "Aadi", ta: "ஆடி" },
  { en: "Aavani", ta: "ஆவணி" },
  { en: "Purattasi", ta: "புரட்டாசி" },
  { en: "Aippasi", ta: "ஐப்பசி" },
  { en: "Karthigai", ta: "கார்த்திகை" },
  { en: "Margazhi", ta: "மார்கழி" },
  { en: "Thai", ta: "தை" },
  { en: "Maasi", ta: "மாசி" },
  { en: "Panguni", ta: "பங்குனி" },
] as const;

let cachedToken: { value: string; expiresAt: number } | null = null;
let tokenInFlight: Promise<string | null> | null = null;

const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours
const responseCache = new Map<string, { data: PanchangamData; expiresAt: number }>();
const requestInFlight = new Map<
  string,
  Promise<{ ok: true; data: PanchangamData } | { ok: false; error: string }>
>();

/**
 * Computes the Nirayana solar longitude (Lahiri Ayanamsa) to determine
 * the Tamil solar month (Rasi) and day number for a given YYYY-MM-DD in IST.
 */
function sunNirayanaLongitude(jd: number): number {
  const T = (jd - 2451545.0) / 36525.0;
  let L0 = (280.46646 + 36000.76983 * T + 0.0003032 * T * T) % 360;
  if (L0 < 0) L0 += 360;
  const M = ((357.52911 + 35999.05029 * T - 0.0001537 * T * T) * Math.PI) / 180;
  const C =
    (1.914602 - 0.004817 * T - 0.000014 * T * T) * Math.sin(M) +
    (0.019993 - 0.000101 * T) * Math.sin(2 * M) +
    0.000289 * Math.sin(3 * M);
  const trueLong = L0 + C;
  const omega = ((125.04 - 1934.136 * T) * Math.PI) / 180;
  const apparent = trueLong - 0.00569 - 0.00478 * Math.sin(omega);
  const ayanamsa = 23.853056 + (50.290966 / 3600) * ((jd - 2451545.0) / 365.25);
  let nirayana = (apparent - ayanamsa) % 360;
  if (nirayana < 0) nirayana += 360;
  return nirayana;
}

function toJulianDayIST(year: number, month: number, day: number, hourIST = 15): number {
  const utcHours = hourIST - 5.5;
  return Date.UTC(year, month - 1, day) / 86400000 + 2440587.5 + utcHours / 24;
}

export function computeTamilMonthAndDay(dateStr: string, locale: "en" | "ta") {
  const [y, m, d] = dateStr.split("-").map(Number);
  const jd = toJulianDayIST(y, m, d, 15);
  const lon = sunNirayanaLongitude(jd);
  const rasi = Math.floor(lon / 30) % 12;

  let dayNum = 1;
  for (let back = 1; back <= 32; back++) {
    const prevLon = sunNirayanaLongitude(jd - back);
    if (Math.floor(prevLon / 30) % 12 === rasi) {
      dayNum++;
    } else {
      break;
    }
  }

  const monthObj = TAMIL_MONTHS[rasi] ?? TAMIL_MONTHS[0];
  const tamilMonth = locale === "ta" ? monthObj.ta : monthObj.en;
  return {
    tamilMonth,
    tamilDay: dayNum,
    tamilDateFormatted: `${tamilMonth} ${dayNum}`,
  };
}

function formatISTTime(isoString?: string): string {
  if (!isoString) return "—";
  const date = new Date(isoString);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("en-IN", {
    timeZone: "Asia/Kolkata",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  })
    .format(date)
    .toUpperCase();
}

function formatPeriodRange(periods?: ProkeralaPeriodItem[]): string {
  if (!periods || periods.length === 0) return "—";
  return periods
    .map((p) => `${formatISTTime(p.start)} – ${formatISTTime(p.end)}`)
    .join(", ");
}

function deriveObservances(
  tithis: ProkeralaTithiItem[],
  nakshatras: ProkeralaNakshatraItem[],
  locale: "en" | "ta",
): PanchangamObservance[] {
  const observances: PanchangamObservance[] = [];
  const seen = new Set<string>();

  for (const t of tithis) {
    const nameLower = t.name.toLowerCase();
    const pakshaLower = t.paksha.toLowerCase();
    const isKrishna = pakshaLower.includes("krishna") || pakshaLower.includes("கிருஷ்ண");

    if (
      (t.id === 35 || nameLower.includes("chaturthi") || t.name.includes("சதுர்த்தி")) &&
      isKrishna &&
      !seen.has("sankatahara-chaturthi")
    ) {
      seen.add("sankatahara-chaturthi");
      observances.push({
        id: "sankatahara-chaturthi",
        title: locale === "ta" ? "சங்கடஹர சதுர்த்தி" : "Sankatahara Chaturthi",
        subtitle:
          locale === "ta"
            ? "ஸ்ரீ சக்தி விநாயகருக்கு சிறப்பு அபிஷேகம் மற்றும் சதுர்த்தி பூஜை"
            : "Auspicious day for Lord Vinayagar special Abhishekam & Chaturthi Pooja",
      });
    } else if (
      (t.id === 4 || nameLower.includes("chaturthi") || t.name.includes("சதுர்த்தி")) &&
      !isKrishna &&
      !seen.has("shukla-chaturthi")
    ) {
      seen.add("shukla-chaturthi");
      observances.push({
        id: "shukla-chaturthi",
        title: locale === "ta" ? "வளர்பிறை சதுர்த்தி" : "Valarpirai Chaturthi",
        subtitle:
          locale === "ta"
            ? "விநாயகர் பெருமானுக்கு சிறப்பு வழிபாடு"
            : "Special Chaturthi prayers for Lord Ganesha",
      });
    }

    if (
      (t.id === 46 || nameLower.includes("amavasya") || t.name.includes("அமாவாசை")) &&
      !seen.has("amavasya")
    ) {
      seen.add("amavasya");
      observances.push({
        id: "amavasya",
        title: locale === "ta" ? "அமாவாசை சிறப்பு வழிபாடு" : "Amavasya (New Moon)",
        subtitle:
          locale === "ta"
            ? "அமாவாசை சிறப்பு அபிஷேகம் மற்றும் தீப ஆராதனை"
            : "Special New Moon prayers and Deepa Aradhana",
      });
    }

    if (
      (t.id === 15 || nameLower.includes("purnima") || t.name.includes("பௌர்ணமி")) &&
      !seen.has("pournami")
    ) {
      seen.add("pournami");
      observances.push({
        id: "pournami",
        title: locale === "ta" ? "பௌர்ணமி சிறப்பு பூஜை" : "Pournami (Full Moon)",
        subtitle:
          locale === "ta"
            ? "பௌர்ணமி சிறப்பு அபிஷேகம் மற்றும் அலங்கார ஆராதனை"
            : "Full Moon special Abhishekam & Alankara Aradhana",
      });
    }

    if (
      (t.id === 13 || t.id === 44 || nameLower.includes("trayodashi") || t.name.includes("திரயோதசி")) &&
      !seen.has("pradosham")
    ) {
      seen.add("pradosham");
      observances.push({
        id: "pradosham",
        title: locale === "ta" ? "பிரதோஷ வழிபாடு" : "Pradosham",
        subtitle:
          locale === "ta"
            ? "மாலை பிரதோஷ கால சிறப்பு வழிபாடு"
            : "Auspicious evening Pradosha Kaala worship",
      });
    }

    if (
      (t.id === 6 || t.id === 37 || nameLower.includes("shashthi") || t.name.includes("சஷ்டி")) &&
      !seen.has("sashti")
    ) {
      seen.add("sashti");
      observances.push({
        id: "sashti",
        title: locale === "ta" ? "சஷ்டி விரதம்" : "Sashti Viratham",
        subtitle:
          locale === "ta"
            ? "சஷ்டி சிறப்பு அபிஷேகம் மற்றும் வழிபாடு"
            : "Auspicious Sashti prayers and worship",
      });
    }

    if (
      (t.id === 11 || t.id === 42 || nameLower.includes("ekadashi") || t.name.includes("ஏகாதசி")) &&
      !seen.has("ekadashi")
    ) {
      seen.add("ekadashi");
      observances.push({
        id: "ekadashi",
        title: locale === "ta" ? "ஏகாதசி" : "Ekadashi",
        subtitle:
          locale === "ta" ? "ஏகாதசி விரதம் மற்றும் சிறப்பு வழிபாடு" : "Auspicious Ekadashi observance",
      });
    }
  }

  for (const n of nakshatras) {
    const nameLower = n.name.toLowerCase();
    if (
      (n.id === 2 || nameLower.includes("krittika") || n.name.includes("கார்த்திகை") || n.name.includes("கிருத்திகை")) &&
      !seen.has("krittika")
    ) {
      seen.add("krittika");
      observances.push({
        id: "krittika",
        title: locale === "ta" ? "கார்த்திகை நட்சத்திர வழிபாடு" : "Karthigai Nakshatra",
        subtitle:
          locale === "ta"
            ? "கார்த்திகை நட்சத்திர சிறப்பு வழிபாடு"
            : "Special monthly Karthigai Nakshatra worship",
      });
    }
  }

  return observances;
}

async function getAccessToken(): Promise<string | null> {
  const clientId = process.env.PROKERALA_CLIENT_ID?.trim();
  const clientSecret = process.env.PROKERALA_CLIENT_SECRET?.trim();

  if (!clientId || !clientSecret) {
    return null;
  }

  if (cachedToken && Date.now() < cachedToken.expiresAt) {
    return cachedToken.value;
  }

  if (tokenInFlight) {
    return tokenInFlight;
  }

  tokenInFlight = (async () => {
    try {
      const res = await fetch(PROKERALA_TOKEN_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          grant_type: "client_credentials",
          client_id: clientId,
          client_secret: clientSecret,
        }),
        cache: "no-store",
      });

      if (!res.ok) {
        console.warn("[prokerala] Failed to obtain OAuth token:", await res.text());
        return null;
      }

      const data = (await res.json()) as { access_token?: string; expires_in?: number };
      if (!data.access_token) return null;

      const expiresIn = Math.max(Number(data.expires_in ?? 3600) - 60, 60);
      cachedToken = {
        value: data.access_token,
        expiresAt: Date.now() + expiresIn * 1000,
      };
      return data.access_token;
    } catch (error) {
      console.warn("[prokerala] OAuth token error:", error);
      return null;
    } finally {
      tokenInFlight = null;
    }
  })();

  return tokenInFlight;
}

export async function fetchPanchangamData(
  dateStr: string,
  rawLocale: string = "en",
): Promise<{ ok: true; data: PanchangamData } | { ok: false; error: string }> {
  const locale: "en" | "ta" = rawLocale === "ta" ? "ta" : "en";
  const cacheKey = `${dateStr}:${locale}`;
  const now = Date.now();

  const existing = responseCache.get(cacheKey);
  if (existing && existing.expiresAt > now) {
    return { ok: true, data: existing.data };
  }

  const inFlight = requestInFlight.get(cacheKey);
  if (inFlight) {
    return inFlight;
  }

  const promise = (async (): Promise<
    { ok: true; data: PanchangamData } | { ok: false; error: string }
  > => {
    try {
      const token = await getAccessToken();
      if (!token) {
        return { ok: false, error: "Prokerala API credentials not configured or token failed." };
      }

      const params = new URLSearchParams({
        ayanamsa: "1",
        coordinates: `${TEMPLE_COORDINATES.latitude},${TEMPLE_COORDINATES.longitude}`,
        datetime: `${dateStr}T06:00:00+05:30`,
        la: locale,
      });

      const url = `${PROKERALA_PANCHANG_URL}?${params.toString()}`;
      let res = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
        next: { revalidate: 86400 },
      });

      if (res.status === 401) {
        cachedToken = null;
        const freshToken = await getAccessToken();
        if (freshToken) {
          res = await fetch(url, {
            headers: {
              Authorization: `Bearer ${freshToken}`,
              Accept: "application/json",
            },
            next: { revalidate: 86400 },
          });
        }
      }

      if (!res.ok) {
        const errBody = (await res.json().catch(() => null)) as ProkeralaAdvancedPanchangResponse | null;
        const detail = errBody?.errors?.[0]?.detail || `HTTP ${res.status}`;
        console.warn("[prokerala] Panchangam API error:", detail);
        return { ok: false, error: detail };
      }

      const payload = (await res.json()) as ProkeralaAdvancedPanchangResponse;
      const d = payload.data;
      if (!d) {
        return { ok: false, error: "Empty Panchangam response from Prokerala." };
      }

      const tithis = d.tithi ?? [];
      const nakshatras = d.nakshatra ?? [];
      const inauspicious = d.inauspicious_period ?? [];

      const tithiFormatted =
        tithis.length > 0
          ? tithis
              .slice(0, 2)
              .map((t, idx) =>
                idx === 0
                  ? `${t.paksha ? `${t.paksha} ` : ""}${t.name} (${locale === "ta" ? "வரை" : "till"} ${formatISTTime(t.end)})`
                  : t.name,
              )
              .join(" → ")
          : "—";

      const nakshatraFormatted =
        nakshatras.length > 0
          ? nakshatras
              .slice(0, 2)
              .map((n, idx) =>
                idx === 0
                  ? `${n.name} (${locale === "ta" ? "வரை" : "till"} ${formatISTTime(n.end)})`
                  : n.name,
              )
              .join(" → ")
          : "—";

      const rahuItem =
        inauspicious.find((item) => item.id === 4 || /rahu|ராகு/i.test(item.name)) ?? null;
      const yamaItem =
        inauspicious.find((item) => item.id === 5 || /yama|யமகண்ட/i.test(item.name)) ?? null;

      const tamilCal = computeTamilMonthAndDay(dateStr, locale);
      const observances = deriveObservances(tithis, nakshatras, locale);

      const result: PanchangamData = {
        date: dateStr,
        tamilMonth: tamilCal.tamilMonth,
        tamilDay: tamilCal.tamilDay,
        tamilDateFormatted: tamilCal.tamilDateFormatted,
        weekday: d.vaara ?? "",
        tithi: tithiFormatted,
        nakshatra: nakshatraFormatted,
        rahuKalam: formatPeriodRange(rahuItem?.period),
        yamagandam: formatPeriodRange(yamaItem?.period),
        sunrise: formatISTTime(d.sunrise),
        sunset: formatISTTime(d.sunset),
        observances,
      };

      responseCache.set(cacheKey, {
        data: result,
        expiresAt: Date.now() + CACHE_TTL_MS,
      });

      return { ok: true, data: result };
    } catch (error) {
      console.warn("[prokerala] Panchangam fetch error:", error);
      return {
        ok: false,
        error: error instanceof Error ? error.message : String(error),
      };
    } finally {
      requestInFlight.delete(cacheKey);
    }
  })();

  requestInFlight.set(cacheKey, promise);
  return promise;
}
