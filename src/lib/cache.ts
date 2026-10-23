/**
 * Distributed Key-Value Store Interface
 * Allows seamless switching between:
 * - Upstash / Redis (production multi-region serverless)
 * - In-memory Map (local development / testing / zero-setup demo)
 */

interface CacheEntry<T> {
  data: T;
  expiresAt: number;
}

const memoryStore = new Map<string, CacheEntry<any>>();

function getUpstashConfig() {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (url && token && !url.includes('example') && !token.includes('...')) {
    return { url, token };
  }
  return null;
}

/**
 * Executes a REST command against Upstash Redis
 */
async function upstashCommand<T = any>(command: string, ...args: (string | number)[]): Promise<T | null> {
  const config = getUpstashConfig();
  if (!config) return null;

  try {
    const res = await fetch(`${config.url}/${[command, ...args.map(a => encodeURIComponent(String(a)))].join('/')}`, {
      headers: {
        Authorization: `Bearer ${config.token}`
      },
      signal: AbortSignal.timeout(3000)
    });
    if (res.ok) {
      const json = await res.json();
      return json.result as T;
    }
  } catch (err) {
    console.warn(`Upstash command ${command} failed, falling back to in-memory store:`, err);
  }
  return null;
}

/**
 * Universal get-or-set cache with TTL
 */
export async function getOrSetCache<T>(
  key: string,
  ttlSeconds: number,
  fetcher: () => Promise<T>
): Promise<T> {
  const upstash = getUpstashConfig();

  if (upstash) {
    try {
      const cached = await upstashCommand<string>('get', key);
      if (cached) {
        return JSON.parse(cached) as T;
      }
    } catch {
      // Fallback below
    }
  } else {
    const local = memoryStore.get(key);
    const now = Date.now();
    if (local && local.expiresAt > now) {
      return local.data;
    }
  }

  // Compute fresh value
  const freshData = await fetcher();

  if (upstash) {
    try {
      await upstashCommand('setex', key, ttlSeconds, JSON.stringify(freshData));
    } catch (e) {
      console.warn('Failed to set Upstash cache key:', e);
    }
  } else {
    memoryStore.set(key, {
      data: freshData,
      expiresAt: Date.now() + ttlSeconds * 1000
    });
  }

  return freshData;
}

/**
 * Universal cache invalidator
 */
export async function invalidateCache(keyPrefix?: string): Promise<void> {
  const upstash = getUpstashConfig();

  if (upstash && keyPrefix) {
    try {
      const keys = await upstashCommand<string[]>('keys', `${keyPrefix}*`);
      if (Array.isArray(keys) && keys.length > 0) {
        for (const k of keys) {
          await upstashCommand('del', k);
        }
      }
    } catch (e) {
      console.warn('Failed to invalidate Upstash cache keys:', e);
    }
  }

  if (!keyPrefix) {
    memoryStore.clear();
    return;
  }
  for (const key of memoryStore.keys()) {
    if (key.startsWith(keyPrefix)) {
      memoryStore.delete(key);
    }
  }
}
