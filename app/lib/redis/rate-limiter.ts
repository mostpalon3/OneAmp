import { redis } from './client';

/**
 * Sliding-window rate limiter backed by Redis.
 * Falls back to allowing the request if Redis is unavailable
 * (fail-open to avoid breaking the app when cache is down).
 */
export const RateLimiter = {
  /**
   * Check & increment a rate-limit counter.
   * @param key      Unique key, e.g. "rl:songs:userId:jamId"
   * @param limit    Max allowed hits in the window
   * @param windowSec Window size in seconds
   * @returns { allowed: boolean, remaining: number, resetIn: number }
   */
  async check(
    key: string,
    limit: number,
    windowSec: number,
  ): Promise<{ allowed: boolean; remaining: number; resetIn: number }> {
    try {
      const current = await redis.get(key);
      const count = current ? parseInt(current, 10) : 0;

      if (count >= limit) {
        // Get TTL so the caller can tell the user when the window resets
        const ttlKey = `${key}:ttl`;
        const ttlRaw = await redis.get(ttlKey);
        const resetIn = ttlRaw ? parseInt(ttlRaw, 10) : windowSec;
        return { allowed: false, remaining: 0, resetIn };
      }

      // Increment counter
      const newCount = count + 1;
      // Store the expiry time as a separate key for reset reporting
      const ttlKey = `${key}:ttl`;
      if (count === 0) {
        // First hit — set both keys with the full window TTL
        await redis.setEx(key, windowSec, String(newCount));
        await redis.setEx(ttlKey, windowSec, String(windowSec));
      } else {
        // Update count only — let the original expiry stand
        await redis.setEx(key, windowSec, String(newCount));
      }

      return {
        allowed: true,
        remaining: limit - newCount,
        resetIn: windowSec,
      };
    } catch (err) {
      // Redis unavailable → fail open (allow the request)
      console.warn('RateLimiter: Redis error, failing open:', err);
      return { allowed: true, remaining: 1, resetIn: 0 };
    }
  },
};

/**
 * Pre-built limiters for the two app rules:
 *   - Song add:  5 songs per user per jam per 30 min
 *   - Vote:      10 votes per user per min (across all jams)
 */
export function songAddKey(userId: string, jamId: string) {
  return `rl:song_add:${userId}:${jamId}`;
}

export function voteKey(userId: string) {
  return `rl:vote:${userId}`;
}

export const SONG_ADD_LIMIT   = 5;
export const SONG_ADD_WINDOW  = 30 * 60; // 30 minutes in seconds

export const VOTE_LIMIT  = 10;
export const VOTE_WINDOW = 60; // 1 minute in seconds
