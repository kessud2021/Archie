/**
 * Simple in-memory cache with TTL support
 */

import { CACHE_TTL } from "../config/constants.js";

interface CacheEntry<T> {
  data: T;
  expires: number;
}

class Cache {
  private storage: Map<string, CacheEntry<any>> = new Map();

  /**
   * Get cached value if not expired
   */
  get<T>(key: string): T | null {
    const entry = this.storage.get(key);
    if (!entry) return null;

    if (Date.now() >= entry.expires) {
      this.storage.delete(key);
      return null;
    }

    return entry.data as T;
  }

  /**
   * Set cache value with TTL
   */
  set<T>(key: string, data: T, ttl: number = CACHE_TTL): void {
    this.storage.set(key, {
      data,
      expires: Date.now() + ttl,
    });
  }

  /**
   * Clear specific cache entry
   */
  delete(key: string): void {
    this.storage.delete(key);
  }

  /**
   * Clear all cache
   */
  clear(): void {
    this.storage.clear();
  }
}

export const cache = new Cache();
