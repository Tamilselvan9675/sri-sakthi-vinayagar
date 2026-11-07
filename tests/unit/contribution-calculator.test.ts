import { Decimal } from "decimal.js";
import { describe, expect, it } from "vitest";
import { ContributionCalculator } from "@/features/finance/calculations/ContributionCalculator";

describe("ContributionCalculator", () => {
  const expected = new Decimal("500.00");
  const dueDate = new Date("2026-10-01");

  it("identifies a pending contribution before its due date", () => {
    const status = ContributionCalculator.calculateStatus(
      expected,
      new Decimal(0),
      dueDate,
      new Date("2026-09-15"),
    );

    expect(status).toBe("PENDING");
  });

  it("identifies an overdue contribution after its due date", () => {
    const status = ContributionCalculator.calculateStatus(
      expected,
      new Decimal(0),
      dueDate,
      new Date("2026-10-05"),
    );

    expect(status).toBe("OVERDUE");
  });

  it("identifies a partially paid contribution", () => {
    const status = ContributionCalculator.calculateStatus(
      expected,
      new Decimal(200),
      dueDate,
      new Date("2026-09-15"),
    );

    expect(status).toBe("PARTIAL");
  });

  it("identifies a fully paid contribution", () => {
    const status = ContributionCalculator.calculateStatus(
      expected,
      new Decimal(500),
      dueDate,
      new Date("2026-09-15"),
    );

    expect(status).toBe("PAID");
  });

  it("calculates the remaining balance", () => {
    const balance = ContributionCalculator.calculateRemainingBalance(expected, new Decimal(200));

    expect(balance.equals(new Decimal(300))).toBe(true);
  });
});
