import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { finalize, shareReplay, tap } from 'rxjs/operators';

interface CacheEntry<T> {
  data: T;
  expires: number;
  timestamp: number;
}

@Injectable({
  providedIn: 'root'
})
export class CacheService {
  private cache = new Map<string, CacheEntry<unknown>>();
  private inflight = new Map<string, Observable<unknown>>();

  /**
   * Get data from cache or execute the fetcher function.
   * Concurrent requests for the same key share one in-flight HTTP call.
   */
  get<T>(key: string, fetcher: () => Observable<T>, ttl: number = 5 * 60 * 1000): Observable<T> {
    const cached = this.cache.get(key);

    if (cached && cached.expires > Date.now()) {
      return of(cached.data as T);
    }

    const pending = this.inflight.get(key);
    if (pending) {
      return pending as Observable<T>;
    }

    const request$ = fetcher().pipe(
      tap(data => {
        if (ttl > 0) {
          this.set(key, data, ttl);
        }
      }),
      finalize(() => {
        this.inflight.delete(key);
      }),
      shareReplay(1)
    );

    this.inflight.set(key, request$ as Observable<unknown>);
    return request$;
  }

  set<T>(key: string, data: T, ttl: number = 5 * 60 * 1000): void {
    this.cache.set(key, {
      data,
      expires: Date.now() + ttl,
      timestamp: Date.now()
    });
  }

  invalidate(key: string): void {
    this.cache.delete(key);
    this.inflight.delete(key);
  }

  invalidatePattern(pattern: string): void {
    const regex = new RegExp('^' + pattern.replace(/\*/g, '.*') + '$');
    const keysToDelete: string[] = [];

    this.cache.forEach((_, key) => {
      if (regex.test(key)) {
        keysToDelete.push(key);
      }
    });

    this.inflight.forEach((_, key) => {
      if (regex.test(key)) {
        keysToDelete.push(key);
      }
    });

    keysToDelete.forEach(key => {
      this.cache.delete(key);
      this.inflight.delete(key);
    });
  }

  clear(): void {
    this.cache.clear();
    this.inflight.clear();
  }

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
