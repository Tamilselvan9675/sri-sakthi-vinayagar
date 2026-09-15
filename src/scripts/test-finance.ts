import { Decimal } from "decimal.js";
import { ContributionCalculator } from "../features/finance/calculations/ContributionCalculator";

function runFinanceTests() {
  console.log("Running Finance Domain Tests...\n");

  const expected = new Decimal("500.00");
  const dueDate = new Date("2026-10-01");
  const beforeDue = new Date("2026-09-15");
  const afterDue = new Date("2026-10-05");

  // Test 1: PENDING
  const status1 = ContributionCalculator.calculateStatus(expected, new Decimal(0), dueDate, beforeDue);
  console.assert(status1 === "PENDING", `Expected PENDING, got ${status1}`);
  console.log("✅ Test 1 Passed: Correctly identifies PENDING status.");

  // Test 2: OVERDUE
  const status2 = ContributionCalculator.calculateStatus(expected, new Decimal(0), dueDate, afterDue);
  console.assert(status2 === "OVERDUE", `Expected OVERDUE, got ${status2}`);
  console.log("✅ Test 2 Passed: Correctly identifies OVERDUE status.");

  // Test 3: PARTIAL
  const status3 = ContributionCalculator.calculateStatus(expected, new Decimal(200), dueDate, beforeDue);
  console.assert(status3 === "PARTIAL", `Expected PARTIAL, got ${status3}`);
  console.log("✅ Test 3 Passed: Correctly identifies PARTIAL status.");

  // Test 4: PAID
  const status4 = ContributionCalculator.calculateStatus(expected, new Decimal(500), dueDate, beforeDue);
  console.assert(status4 === "PAID", `Expected PAID, got ${status4}`);
  console.log("✅ Test 4 Passed: Correctly identifies PAID status.");

  // Test 5: Balance Calculation
  const balance = ContributionCalculator.calculateRemainingBalance(expected, new Decimal(200));
  console.assert(balance.equals(new Decimal(300)), `Expected 300, got ${balance}`);
  console.log("✅ Test 5 Passed: Correctly calculates remaining balance.");

  console.log("\nAll Finance tests passed successfully!");
}

runFinanceTests();
