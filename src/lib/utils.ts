/**
 * Shared Utility Functions
 *
 * Re-exports the shadcn `cn` utility and provides additional
 * general-purpose utilities used across the application.
 *
 * Usage:
 *   import { cn, formatCurrency, formatDate } from "@/lib/utils";
 */

// Re-export cn from shadcn's cn package (configured by shadcn init)
export { cn } from "cn";

/**
 * Format currency in Indian Rupees.
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
}

/**
 * Format a date for display.
 */
export function formatDate(
  date: Date | string,
  locale: string = "en-IN",
): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat(locale, {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(d);
}

/**
 * Slugify a string for URL-safe usage.
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * Delay execution (useful for development/testing).
 */
export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
