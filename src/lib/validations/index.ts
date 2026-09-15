/**
 * Base Zod Validation Schemas
 *
 * Centralized validation schemas used across the application.
 * Feature-specific schemas should be placed in their respective
 * feature directories and re-exported here if shared.
 *
 * Usage:
 *   import { idSchema, paginationSchema } from "@/lib/validations";
 */

import { z } from "zod/v4";

/**
 * Common ID validation (UUID or CUID format).
 */
export const idSchema = z.string().min(1, "ID is required");

/**
 * Pagination parameters.
 */
export const paginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
});

/**
 * Common search/filter parameters.
 */
export const searchSchema = z.object({
  query: z.string().optional(),
  sortBy: z.string().optional(),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

/**
 * Date range filter.
 */
export const dateRangeSchema = z.object({
  from: z.coerce.date().optional(),
  to: z.coerce.date().optional(),
});

// Feature-specific schemas will be added as features are built.
// Example:
// export { festivalSchema } from "@/features/festival/validations";
