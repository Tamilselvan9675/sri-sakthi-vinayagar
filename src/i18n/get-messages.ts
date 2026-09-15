/**
 * i18n Message Loader
 *
 * Loads translation messages for a given locale.
 * Falls back to the default locale if the requested locale is not found.
 *
 * Usage:
 *   const messages = await getMessages("ta");
 */

import type { Locale } from "@/types";
import { defaultLocale, isValidLocale } from "./config";

// Type for the message structure
export interface Messages {
  common: Record<string, string>;
  site: Record<string, string>;
  theme: Record<string, string>;
  [key: string]: Record<string, string>;
}

/**
 * Load messages for the specified locale.
 * Uses dynamic import for code-splitting by locale.
 */
export async function getMessages(locale: string): Promise<Messages> {
  const validLocale: Locale = isValidLocale(locale) ? locale : defaultLocale;

  try {
    const messages = (await import(`./messages/${validLocale}.json`)) as {
      default: Messages;
    };
    return messages.default;
  } catch {
    // Fallback to default locale
    const fallback = (await import(
      `./messages/${defaultLocale}.json`
    )) as { default: Messages };
    return fallback.default;
  }
}

/**
 * Get a specific translation by key path (e.g., "common.home").
 */
export function getMessage(
  messages: Messages,
  keyPath: string,
): string {
  const keys = keyPath.split(".");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let current: any = messages;

  for (const key of keys) {
    if (typeof current === "object" && current !== null && key in current) {
      current = current[key];
    } else {
      return keyPath; // Return the key path as fallback
    }
  }

  return typeof current === "string" ? current : keyPath;
}
