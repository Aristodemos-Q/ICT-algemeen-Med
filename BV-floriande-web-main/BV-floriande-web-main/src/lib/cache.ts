/*
 * BV Floriande Web Application
 * © 2025 qdela. All rights reserved.
 * 
 * This file is part of the BV Floriande Trainers Platform.
 * Unauthorized copying, modification, or distribution is prohibited.
 */

/**
 * Simple in-memory cache implementation with TTL support
 * This can be replaced with a Redis client or other cache provider in production
 */

type CacheEntry<T> = {
  value: T;
  expiresAt: number;
};

class Cache {
  private cache: Map<string, CacheEntry<any>> = new Map();

  /**
   * Set a value in the cache with an expiration time
   * @param key The cache key
   * @param value The value to cache
   * @param ttlSeconds Time to live in seconds
   */
  set<T>(key: string, value: T, ttlSeconds: number): void {
    const expiresAt = Date.now() + ttlSeconds * 1000;
    this.cache.set(key, { value, expiresAt });
  }

  /**
   * Get a value from the cache
   * @param key The cache key
   * @returns The cached value or undefined if not found or expired
   */
  get<T>(key: string): T | undefined {
    const entry = this.cache.get(key);
    if (!entry) return undefined;

    // Check if the entry has expired
    if (entry.expiresAt < Date.now()) {
      this.cache.delete(key);
      return undefined;
    }

    return entry.value as T;
  }

  /**
   * Check if a key exists in the cache and is not expired
   * @param key The cache key 
   * @returns True if the key exists and is not expired
   */
  has(key: string): boolean {
    const entry = this.cache.get(key);
    if (!entry) return false;

    // Check if the entry has expired
    if (entry.expiresAt < Date.now()) {
      this.cache.delete(key);
      return false;
    }

    return true;
  }

  /**
   * Delete a key from the cache
   * @param key The cache key to delete
   */
  delete(key: string): void {
    this.cache.delete(key);
  }

  /**
   * Delete all keys that match a prefix
   * @param prefix The prefix to match
   */
  deleteByPrefix(prefix: string): void {
    for (const key of this.cache.keys()) {
      if (key.startsWith(prefix)) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Get or set a value in the cache, with a function to generate the value if not found
   * @param key The cache key
   * @param ttlSeconds Time to live in seconds
   * @param fetchFn Function to fetch the value if not in cache
   * @returns The cached or newly fetched value
   */
  async getOrSet<T>(
    key: string, 
    ttlSeconds: number, 
    fetchFn: () => Promise<T>
  ): Promise<T> {
    const cached = this.get<T>(key);
    if (cached !== undefined) {
      return cached;
    }

    // Value not in cache, fetch it
    const value = await fetchFn();
    this.set(key, value, ttlSeconds);
    return value;
  }

  /**
   * Clear the entire cache
   */
  clear(): void {
    this.cache.clear();
  }
}

// Export a singleton cache instance for the application
export const cache = new Cache();

// Helper utility for caching API responses
export const withCache = async <T>(
  key: string,
  ttlSeconds: number,
  fetchFn: () => Promise<T>
): Promise<T> => {
  return cache.getOrSet(key, ttlSeconds, fetchFn);
};
