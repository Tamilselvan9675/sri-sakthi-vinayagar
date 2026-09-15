import { Decimal } from "decimal.js";
import { ContributionStatus } from "@/generated/prisma/client";

export class ContributionCalculator {
  /**
   * Calculates the status of a contribution based on expected vs paid amounts.
   * Assumes strict no-lending / no-interest compliance.
   *
   * @param expectedAmount The amount due for the period
   * @param paidAmount The amount actually paid
   * @param dueDate The deadline for the payment
   * @param currentDate The current evaluation date (defaults to now)
   * @returns ContributionStatus
   */
  static calculateStatus(
    expectedAmount: Decimal,
    paidAmount: Decimal,
    dueDate: Date,
    currentDate: Date = new Date()
  ): ContributionStatus {
    const isPastDue = currentDate > dueDate;

    if (paidAmount.gte(expectedAmount)) {
      return "PAID";
    }

    if (paidAmount.gt(0) && paidAmount.lt(expectedAmount)) {
      return "PARTIAL";
    }

    if (paidAmount.eq(0) && isPastDue) {
      return "OVERDUE";
    }

    return "PENDING";
  }

  /**
   * Calculates the remaining balance for a given contribution.
   */
  static calculateRemainingBalance(expectedAmount: Decimal, paidAmount: Decimal): Decimal {
    const balance = expectedAmount.minus(paidAmount);
    // Return 0 if overpaid, as we do not handle credit/lending
    return balance.gt(0) ? balance : new Decimal(0);
  }
}
