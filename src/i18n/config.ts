/**
 * i18n Configuration
 *
 * Defines supported locales and the default locale for the application.
 */

import type { Locale } from "@/types";

export const defaultLocale: Locale = "en";

export const locales: Locale[] = ["en", "ta"];

export const localeNames: Record<Locale, string> = {
  en: "English",
  ta: "தமிழ்",
};

/**
 * Check if a string is a valid locale.
 */
export function isValidLocale(locale: string): locale is Locale {
  return locales.includes(locale as Locale);
}
