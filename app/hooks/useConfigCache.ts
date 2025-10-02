import { useState, useCallback } from 'react';

interface CacheEntry {
  data: any;
  timestamp: number;
}

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
const cache = new Map<string, CacheEntry>();

export function useConfigCache() {
  const [, setUpdate] = useState(0);

  const getCached = useCallback((key: string) => {
    const entry = cache.get(key);
    if (entry && Date.now() - entry.timestamp < CACHE_DURATION) {
      return entry.data;
    }
    return null;
  }, []);

  const setCached = useCallback((key: string, data: any) => {
    cache.set(key, { data, timestamp: Date.now() });
    setUpdate(prev => prev + 1);
  }, []);

  const invalidate = useCallback((key: string) => {
    cache.delete(key);
  }, []);

  return { getCached, setCached, invalidate };
}