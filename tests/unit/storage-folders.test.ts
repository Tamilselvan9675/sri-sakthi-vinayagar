import { describe, expect, it } from "vitest";
import { resolveStorageFolder } from "@/lib/storage/folders";

describe("resolveStorageFolder", () => {
  it("routes images to media/gallery", () => {
    expect(resolveStorageFolder("media", "image/jpeg")).toBe("media/gallery");
  });

  it("routes videos to media/videos", () => {
    expect(resolveStorageFolder("media", "video/mp4")).toBe("media/videos");
  });

  it("routes finance files to financial-reports regardless of type", () => {
    expect(resolveStorageFolder("expense-files", "application/pdf")).toBe("financial-reports");
    expect(resolveStorageFolder("donor-files", "application/pdf")).toBe("financial-reports");
  });
});
