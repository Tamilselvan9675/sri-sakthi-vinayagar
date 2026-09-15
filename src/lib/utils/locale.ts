/**
 * Locale Utilities
 * 
 * Helpers for resolving bilingual content based on the current locale.
 */

/**
 * Gets the localized value from a bilingual entity.
 * 
 * Assumes the entity has fields named like `titleEn` and `titleTa`.
 * 
 * @param entity The database record or object containing bilingual fields
 * @param baseField The base name of the field (e.g., 'title', 'description')
 * @param locale The current locale ('en' | 'ta')
 * @returns The localized string, falling back to English if Tamil is missing, or empty string.
 */
export function getLocalizedField<T extends Record<string, unknown>>(
  entity: T | null | undefined,
  baseField: string,
  locale: string,
): string {
  if (!entity) return "";

  const isTa = locale === "ta";
  const localizedKey = `${baseField}${isTa ? "Ta" : "En"}`;
  const fallbackKey = `${baseField}En`;

  const localizedValue = entity[localizedKey];
  const fallbackValue = entity[fallbackKey];

  if (typeof localizedValue === "string" && localizedValue.trim() !== "") {
    return localizedValue;
  }

  if (typeof fallbackValue === "string" && fallbackValue.trim() !== "") {
    return fallbackValue;
  }

  return "";
}
