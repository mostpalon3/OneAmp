import redis from './client';
import { REDIS_KEYS, CACHE_TTL } from './keys';

export class DashboardCacheService {

  // 🔥 USER PROFILE CACHING
  static async cacheUserProfile(userId: string, profile: any) {
    try {
      const key = REDIS_KEYS.USER_PROFILE(userId);
      await redis.setEx(key, CACHE_TTL.USER_PROFILE, JSON.stringify(profile));
      console.log(`✅ Cached user profile: ${userId}`);
    } catch (error) {
      console.error('Error caching user profile:', error);
    }
  }

  static async getCachedUserProfile(userId: string) {
    try {
      const key = REDIS_KEYS.USER_PROFILE(userId);
      const cached = await redis.get(key);
      if (cached) {
        console.log(`✅ Cache HIT for user profile: ${userId}`);
        return JSON.parse(cached);
      } else {
        console.log(`❌ Cache MISS for user profile: ${userId}`);
        return null;
      }
    } catch (error) {
      console.error('Error getting cached user profile:', error);
      return null;
    }
  }

  // 🔥 USER JAMS LIST CACHING
  static async cacheUserJamsList(userId: string, jams: any[]) {
    try {
      const key = REDIS_KEYS.USER_JAMS_LIST(userId);
      await redis.setEx(key, CACHE_TTL.USER_JAMS_LIST, JSON.stringify(jams));
      console.log(`✅ Cached ${jams.length} jams for user: ${userId}`);
    } catch (error) {
      console.error('Error caching user jams list:', error);
    }
  }

  static async getCachedUserJamsList(userId: string) {
    try {
      const key = REDIS_KEYS.USER_JAMS_LIST(userId);
      const cached = await redis.get(key);
      if (cached) {
        console.log(`✅ Cache HIT for user jams list: ${userId}`);
        return JSON.parse(cached);
      } else {
        console.log(`❌ Cache MISS for user jams list: ${userId}`);
        return null;
      }
    } catch (error) {
      console.error('Error getting cached user jams list:', error);
      return null;
    }
  }

  // 🔥 JAM STATS CACHING (for individual jams)
  static async cacheJamStats(jamId: string, stats: {
    streamCount: number;
    likesCount: number;
  }) {
    try {
      const key = REDIS_KEYS.JAM_STATS(jamId);
      await redis.setEx(key, CACHE_TTL.JAM_STATS, JSON.stringify(stats));
      console.log(`✅ Cached stats for jam: ${jamId}`);
    } catch (error) {
      console.error('Error caching jam stats:', error);
    }
  }

  static async getCachedJamStats(jamId: string) {
    try {
      const key = REDIS_KEYS.JAM_STATS(jamId);
      const cached = await redis.get(key);
      if (cached) {
        console.log(`✅ Cache HIT for jam stats: ${jamId}`);
        return JSON.parse(cached);
      } else {
        console.log(`❌ Cache MISS for jam stats: ${jamId}`);
        return null;
      }
    } catch (error) {
      console.error('Error getting cached jam stats:', error);
      return null;
    }
  }

  // 🔥 USER DASHBOARD CACHING (complete dashboard data)
  static async cacheUserDashboard(userId: string, dashboardData: any) {
    try {
      const key = REDIS_KEYS.USER_DASHBOARD(userId);
      await redis.setEx(key, CACHE_TTL.USER_DASHBOARD, JSON.stringify(dashboardData));
      console.log(`✅ Cached complete dashboard for user: ${userId}`);
    } catch (error) {
      console.error('Error caching user dashboard:', error);
    }
  }

  static async getCachedUserDashboard(userId: string) {
    try {
      const key = REDIS_KEYS.USER_DASHBOARD(userId);
      const cached = await redis.get(key);
      if (cached) {
        console.log(`✅ Cache HIT for user dashboard: ${userId}`);
        return JSON.parse(cached);
      } else {
        console.log(`❌ Cache MISS for user dashboard: ${userId}`);
        return null;
      }
    } catch (error) {
      console.error('Error getting cached user dashboard:', error);
      return null;
    }
  }

  // 🔥 CACHE INVALIDATION METHODS
  static async invalidateUserJamsList(userId: string) {
    try {
      await redis.del(REDIS_KEYS.USER_JAMS_LIST(userId));
      console.log(`✅ Invalidated user jams list cache: ${userId}`);
    } catch (error) {
      console.error('Error invalidating user jams list cache:', error);
    }
  }

  static async invalidateJamStats(jamId: string) {
    try {
      await redis.del(REDIS_KEYS.JAM_STATS(jamId));
      console.log(`✅ Invalidated jam stats cache: ${jamId}`);
    } catch (error) {
      console.error('Error invalidating jam stats cache:', error);
    }
  }

  static async invalidateUserDashboard(userId: string) {
    try {
      const keys = [
        REDIS_KEYS.USER_DASHBOARD(userId),
        REDIS_KEYS.USER_JAMS_LIST(userId),
      ];
      await Promise.all(keys.map(key => redis.del(key)));
      console.log(`✅ Invalidated dashboard cache: ${userId}`);
    } catch (error) {
      console.error('Error invalidating user dashboard cache:', error);
    }
  }

  // 🔥 BULK INVALIDATION (when jam-related data changes)
  static async invalidateJamRelatedCaches(jamId: string, userId: string) {
    try {
      const keys = [
        REDIS_KEYS.JAM_STATS(jamId),
        REDIS_KEYS.USER_JAMS_LIST(userId),
        REDIS_KEYS.USER_DASHBOARD(userId),
      ];
      await Promise.all(keys.map(key => redis.del(key)));
      console.log(`✅ Invalidated jam-related caches: jamId=${jamId}, userId=${userId}`);
    } catch (error) {
      console.error('Error invalidating jam-related caches:', error);
    }
  }
}