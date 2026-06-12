/** Default in-memory cache TTLs for API responses. */
export const CACHE_TTL = {
  /** Volatile data (schedules for non-today, active assignment ids). */
  SHORT: 30 * 1000,
  /** Details pages, payment/invoice views. */
  MEDIUM: 60 * 1000,
  /** User/class lists and enrollment summaries. */
  LONG: 2 * 60 * 1000,
  /** Rarely changing reference data (locations, discounts list). */
  STATIC: 5 * 60 * 1000,
} as const;
