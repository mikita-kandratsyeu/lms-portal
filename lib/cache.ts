import { Redis } from '@upstash/redis';
import NodeCache from 'node-cache';

const TTL_DEFAULT = 60;

export const cacheProvider = (() => {
  if (process.env.NODE_ENV === 'production') {
    return new Redis({
      automaticDeserialization: false,
      token: process.env.NEXT_PUBLIC_REDIS_REST_API_TOKEN as string,
      url: process.env.NEXT_PUBLIC_REDIS_REST_API_URL as string,
    });
  }

  return new NodeCache({
    stdTTL: TTL_DEFAULT,
  });
})();

export const setValueToMemoryCache = async (key: string, value: string, expires = TTL_DEFAULT) => {
  if (cacheProvider instanceof Redis) {
    return cacheProvider.set(key, value, { ex: expires });
  }

  return cacheProvider.set(key, value, expires);
};

export const removeValueFromMemoryCache = async (key: string) => cacheProvider.del(key);

export const getValueFromMemoryCache = async (key: string): Promise<string | null> =>
  cacheProvider.get(key) as string | null;

export const fetchCachedData = async <T>(
  key: string,
  callback: () => Promise<T>,
  expires = TTL_DEFAULT,
) => {
  const cachedData = await getValueFromMemoryCache(key);

  if (cachedData) {
    return JSON.parse(cachedData);
  }

  const response = await callback();

  await setValueToMemoryCache(key, JSON.stringify(response), expires);

  return response;
};
