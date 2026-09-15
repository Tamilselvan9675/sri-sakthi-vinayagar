/**
 * Shared TypeScript Type Definitions
 *
 * Global types used across the application.
 * Feature-specific types should be placed in their respective
 * feature directories.
 */

/**
 * Supported locales for the application.
 */
export type Locale = "en" | "ta";

/**
 * Standard API response wrapper.
 */
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

/**
 * Paginated response wrapper.
 */
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/**
 * Common entity fields (shared by all database models).
 */
export interface BaseEntity {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Navigation item structure.
 */
export interface NavItem {
  title: string;
  href: string;
  icon?: string;
  disabled?: boolean;
  children?: NavItem[];
}

/**
 * Site configuration.
 */
export interface SiteConfig {
  name: string;
  description: string;
  url: string;
  locale: Locale;
}
