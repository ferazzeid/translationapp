interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiry: number;
}

class SettingsCache {
  private cache = new Map<string, CacheEntry<any>>();

  set<T>(key: string, data: T, ttlMinutes: number = 1440): void { // Default 24 hours
    const now = Date.now();
    this.cache.set(key, {
      data,
      timestamp: now,
      expiry: now + (ttlMinutes * 60 * 1000)
    });
    
    // Also persist to localStorage for longer term caching
    try {
      localStorage.setItem(`cache_${key}`, JSON.stringify({
        data,
        timestamp: now,
        expiry: now + (ttlMinutes * 60 * 1000)
      }));
    } catch (error) {
      console.warn('Failed to persist cache to localStorage:', error);
    }
  }

  get<T>(key: string): T | null {
    const now = Date.now();
    
    // Check memory cache first
    let entry = this.cache.get(key);
    
    // If not in memory, try localStorage
    if (!entry) {
      try {
        const stored = localStorage.getItem(`cache_${key}`);
        if (stored) {
          entry = JSON.parse(stored);
          if (entry && entry.expiry > now) {
            // Restore to memory cache
            this.cache.set(key, entry);
          }
        }
      } catch (error) {
        console.warn('Failed to load cache from localStorage:', error);
      }
    }

    if (!entry || entry.expiry <= now) {
      this.invalidate(key);
      return null;
    }

    return entry.data;
  }

  invalidate(key: string): void {
    this.cache.delete(key);
    try {
      localStorage.removeItem(`cache_${key}`);
    } catch (error) {
      console.warn('Failed to remove cache from localStorage:', error);
    }
  }

  clear(): void {
    this.cache.clear();
    // Clear all cache entries from localStorage
    try {
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.startsWith('cache_')) {
          localStorage.removeItem(key);
        }
      });
    } catch (error) {
      console.warn('Failed to clear localStorage cache:', error);
    }
  }
}

export const settingsCache = new SettingsCache();