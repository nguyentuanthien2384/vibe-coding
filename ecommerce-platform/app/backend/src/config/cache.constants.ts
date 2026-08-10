export const CACHE_PREFIX = 'cache';

/**
 * Cache Configuration per Module
 * Includes Module Name, API Version, TTL (seconds) per action, Key generators & Invalidation Prefixes.
 */
export const CACHE_CONFIG = {
  PRODUCTS: {
    MODULE: 'products',
    VERSION: 'v1',
    TTL: {
      FEATURED: 900, // 15 min
      LIST: 300, // 5 min
      FILTER_META: 3600, // 1 hour
    },
    KEYS: {
      FEATURED: (page: number, limit: number) =>
        `${CACHE_PREFIX}:v1:products:featured:p${page}:l${limit}`,
      LIST: (paramHash: string) =>
        `${CACHE_PREFIX}:v1:products:list:${paramHash}`,
      FILTER_META: `${CACHE_PREFIX}:v1:products:filter-meta`,
    },
    PREFIXES: {
      FEATURED: `${CACHE_PREFIX}:v1:products:featured:`,
      LIST: `${CACHE_PREFIX}:v1:products:list:`,
      FILTER_META: `${CACHE_PREFIX}:v1:products:filter-meta`,
    },
  },
  CATEGORIES: {
    MODULE: 'categories',
    VERSION: 'v1',
    TTL: {
      ALL: 3600, // 1 hour
    },
    KEYS: {
      ALL: `${CACHE_PREFIX}:v1:categories:all`,
    },
    PREFIXES: {
      ALL: `${CACHE_PREFIX}:v1:categories:`,
    },
  },
  BANNERS: {
    MODULE: 'banners',
    VERSION: 'v1',
    TTL: {
      LIST: 3600, // 1 hour
    },
    KEYS: {
      BY_TYPE: (type: string) => `${CACHE_PREFIX}:v1:banners:type:${type}`,
    },
    PREFIXES: {
      ALL: `${CACHE_PREFIX}:v1:banners:`,
    },
  },
} as const;
