
import { useState, useCallback, useRef } from 'react';

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiry: number;
}

interface CacheOptions {
  ttl?: number; // Time to live in milliseconds
  maxSize?: number; // Maximum number of entries
}

export const useDataCache = <T>(options: CacheOptions = {}) => {
  const { ttl = 5 * 60 * 1000, maxSize = 100 } = options; // Default 5 minutes TTL
  const cache = useRef<Map<string, CacheEntry<T>>>(new Map());
  const [isLoading, setIsLoading] = useState(false);

  const get = useCallback((key: string): T | null => {
    const entry = cache.current.get(key);
    
    if (!entry) {
      return null;
    }

    // Check if entry has expired
    if (Date.now() > entry.expiry) {
      cache.current.delete(key);
      return null;
    }

    return entry.data;
  }, []);

  const set = useCallback((key: string, data: T): void => {
    // Remove oldest entries if cache is full
    if (cache.current.size >= maxSize) {
      const firstKey = cache.current.keys().next().value;
      if (firstKey) {
        cache.current.delete(firstKey);
      }
    }

    cache.current.set(key, {
      data,
      timestamp: Date.now(),
      expiry: Date.now() + ttl
    });
  }, [ttl, maxSize]);

  const fetchWithCache = useCallback(async (
    key: string,
    fetchFn: () => Promise<T>,
    forceRefresh = false
  ): Promise<T> => {
    // Return cached data if available and not forcing refresh
    if (!forceRefresh) {
      const cachedData = get(key);
      if (cachedData !== null) {
        return cachedData;
      }
    }

    setIsLoading(true);
    try {
      const data = await fetchFn();
      set(key, data);
      return data;
    } finally {
      setIsLoading(false);
    }
  }, [get, set]);

  const clear = useCallback((key?: string): void => {
    if (key) {
      cache.current.delete(key);
    } else {
      cache.current.clear();
    }
  }, []);

  const getStats = useCallback(() => {
    const entries = Array.from(cache.current.values());
    const now = Date.now();
    const valid = entries.filter(entry => now <= entry.expiry);
    const expired = entries.filter(entry => now > entry.expiry);

    return {
      total: cache.current.size,
      valid: valid.length,
      expired: expired.length,
      size: cache.current.size,
      maxSize
    };
  }, [maxSize]);

  return {
    get,
    set,
    fetchWithCache,
    clear,
    getStats,
    isLoading
  };
};
