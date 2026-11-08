import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { parseBudgetFile } from "../../src/lib/pdf/parse-budget-pdf";

const dir = path.resolve(process.cwd(), "expense-files");
const files = fs.existsSync(dir)
  ? fs.readdirSync(dir).filter((f) => /\.(pdf|xlsx)$/i.test(f))
  : [];

describe("parseBudgetFile (CMS uploads)", () => {
  it("returns null for empty or unsupported buffers", () => {
    expect(parseBudgetFile(Buffer.alloc(0), "empty.pdf")).toBeNull();
    expect(parseBudgetFile(Buffer.alloc(0), "empty.xlsx")).toBeNull();
    expect(parseBudgetFile(Buffer.from("invalid"), "notes.txt")).toBeNull();
  });

  for (const name of files) {
    it(`extracts donors and expenses from ${name}`, () => {
      const parsed = parseBudgetFile(fs.readFileSync(path.join(dir, name)), name);
      expect(parsed).not.toBeNull();
      expect(parsed!.donors.length).toBeGreaterThan(0);
      expect(parsed!.expenses.length).toBeGreaterThan(0);
      expect(parsed!.totalIncome).toBeGreaterThan(0);
      expect(parsed!.totalExpense).toBeGreaterThan(0);
      expect(parsed!.balance).toBeGreaterThan(0);
    });
  }
});
