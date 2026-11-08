import "dotenv/config";
import { describe, it, expect } from "vitest";
import { getCmsFinance, getCmsGallery } from "@/lib/cms/content";
import { getWinners, getAllFestivalYears } from "@/lib/api/festival";
import { getTempleSettings } from "@/lib/api/settings";

describe("Loaders Verification", () => {
  it("tests temple settings", async () => {
    const settings = await getTempleSettings();
    expect(settings).not.toBeNull();
    expect(settings?.templeNameEn).toBeDefined();
    expect(settings?.logoUrl).toBeDefined();
  });

  it("tests festival years", async () => {
    const years = await getAllFestivalYears();
    expect(years.length).toBeGreaterThan(0);
  });

  it("tests winners", async () => {
    const winners = await getWinners();
    expect(winners.length).toBeGreaterThan(0);
  });

  it("tests gallery", async () => {
    const gallery = await getCmsGallery();
    expect(gallery.ok).toBe(true);
    expect(gallery.data.length).toBeGreaterThan(0);
  });

  it("tests finance", async () => {
    const finance = await getCmsFinance();
    expect(finance).not.toBeNull();
    expect(finance?.donors?.length).toBeGreaterThan(0);
    expect(finance?.expenses?.length).toBeGreaterThan(0);
  });
});
