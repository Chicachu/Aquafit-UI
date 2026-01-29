import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';

interface CacheEntry<T> {
  data: T;
  expires: number;
  timestamp: number;
}

@Injectable({
  providedIn: 'root'
})
export class CacheService {
  private cache = new Map<string, CacheEntry<any>>();

  /**
   * Get data from cache or execute the fetcher function
   * @param key Cache key
   * @param fetcher Function that returns an Observable to fetch data
   * @param ttl Time to live in milliseconds (default: 5 minutes)
   * @returns Observable with cached or fresh data
   */
  get<T>(key: string, fetcher: () => Observable<T>, ttl: number = 5 * 60 * 1000): Observable<T> {
    const cached = this.cache.get(key);

    // Return cached data if it exists and hasn't expired
    if (cached && cached.expires > Date.now()) {
      return of(cached.data);
    }

    // Fetch fresh data and cache it
    return fetcher().pipe(
      tap(data => {
        this.set(key, data, ttl);
      })
    );
  }

  /**
   * Set data in cache with TTL
   * @param key Cache key
   * @param data Data to cache
   * @param ttl Time to live in milliseconds
   */
  set<T>(key: string, data: T, ttl: number = 5 * 60 * 1000): void {
    this.cache.set(key, {
      data,
      expires: Date.now() + ttl,
      timestamp: Date.now()
    });
  }

  /**
   * Invalidate a specific cache key
   * @param key Cache key to invalidate
   */
  invalidate(key: string): void {
    this.cache.delete(key);
  }

  /**
   * Invalidate all cache keys matching a pattern
   * @param pattern Pattern to match (supports wildcard *)
   */
  invalidatePattern(pattern: string): void {
    const regex = new RegExp('^' + pattern.replace(/\*/g, '.*') + '$');
    const keysToDelete: string[] = [];

    this.cache.forEach((_, key) => {
      if (regex.test(key)) {
        keysToDelete.push(key);
      }
    });

    keysToDelete.forEach(key => this.cache.delete(key));
  }

  /**
   * Clear all cache
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Get cache statistics (useful for debugging)
   */
  getStats(): { size: number; keys: string[]; entries: Array<{ key: string; age: number; expiresIn: number }> } {
    const now = Date.now();
    const entries = Array.from(this.cache.entries()).map(([key, entry]) => ({
      key,
      age: now - entry.timestamp,
      expiresIn: entry.expires - now
    }));

    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys()),
      entries
    };
  }
}
