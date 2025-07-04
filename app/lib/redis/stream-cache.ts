import redis from './client';
import { REDIS_KEYS, CACHE_TTL } from './keys';

export class StreamCacheService {
  // Cache stream queue
  static async cacheStreamQueue(jamId: string, streams: any[]) {
    try {
      const key = REDIS_KEYS.STREAM_QUEUE(jamId);
      await redis.setEx(key, CACHE_TTL.STREAM_QUEUE, JSON.stringify(streams));
      console.log(`✅ Cached ${streams.length} streams for jam: ${jamId}`);
    } catch (error) {
      console.error('Error caching stream queue:', error);
    }
  }

  // Get cached stream queue
  static async getCachedStreamQueue(jamId: string) {
    try {
      const key = REDIS_KEYS.STREAM_QUEUE(jamId);
      const cached = await redis.get(key);
      if (cached) {
        console.log(`✅ Cache HIT for streams in jam: ${jamId}`);
        return JSON.parse(cached);
      } else {
        console.log(`❌ Cache MISS for streams in jam: ${jamId}`);
        return null;
      }
    } catch (error) {
      console.error('Error getting cached stream queue:', error);
      return null;
    }
  }

  // Cache active stream
  static async cacheActiveStream(jamId: string, stream: any) {
    try {
      const key = REDIS_KEYS.ACTIVE_STREAM(jamId);
      await redis.setEx(key, CACHE_TTL.ACTIVE_STREAM, JSON.stringify(stream));
      console.log(`✅ Cached active stream for jam: ${jamId}`);
    } catch (error) {
      console.error('Error caching active stream:', error);
    }
  }

  // Get cached active stream
  static async getCachedActiveStream(jamId: string) {
    try {
      const key = REDIS_KEYS.ACTIVE_STREAM(jamId);
      const cached = await redis.get(key);
      if (cached) {
        console.log(`✅ Cache HIT for active stream in jam: ${jamId}`);
        return JSON.parse(cached);
      } else {
        console.log(`❌ Cache MISS for active stream in jam: ${jamId}`);
        return null;
      }
    } catch (error) {
      console.error('Error getting cached active stream:', error);
      return null;
    }
  }

  // 🔥 Cache video preview data
  static async cacheVideoPreview(videoId: string, previewData: any) {
    try {
      const key = REDIS_KEYS.VIDEO_PREVIEW(videoId);
      // Cache for 24 hours since video metadata rarely changes
      await redis.setEx(key, CACHE_TTL.VIDEO_PREVIEW, JSON.stringify(previewData));
      console.log(`✅ Cached preview for video: ${videoId}`);
    } catch (error) {
      console.error('Error caching video preview:', error);
    }
  }

  // 🔥 Get cached video preview
  static async getCachedVideoPreview(videoId: string) {
    try {
      const key = REDIS_KEYS.VIDEO_PREVIEW(videoId);
      const cached = await redis.get(key);
      if (cached) {
        console.log(`✅ Cache HIT for video preview: ${videoId}`);
        return JSON.parse(cached);
      } else {
        console.log(`❌ Cache MISS for video preview: ${videoId}`);
        return null;
      }
    } catch (error) {
      console.error('Error getting cached video preview:', error);
      return null;
    }
  }

  // Cache user votes for a jam
  static async cacheUserVotes(userId: string, jamId: string, votes: { upvotes: string[], downvotes: string[] }) {
    try {
      const key = REDIS_KEYS.USER_VOTES(userId, jamId);
      await redis.setEx(key, CACHE_TTL.USER_VOTES, JSON.stringify(votes));
    } catch (error) {
      console.error('Error caching user votes:', error);
    }
  }

  // Get cached user votes
  static async getCachedUserVotes(userId: string, jamId: string) {
    try {
      const key = REDIS_KEYS.USER_VOTES(userId, jamId);
      const cached = await redis.get(key);
      return cached ? JSON.parse(cached) : null;
    } catch (error) {
      console.error('Error getting cached user votes:', error);
      return null;
    }
  }

  // Invalidate user votes cache
  static async invalidateUserVotes(userEmail: string, jamId: string) {
    try {
      const key = REDIS_KEYS.USER_VOTES(userEmail, jamId);
      await redis.del(key);
      console.log(`✅ Invalidated user votes cache for ${userEmail} in jam: ${jamId}`);
    } catch (error) {
      console.error('Error invalidating user votes cache:', error);
    }
  }

  // Invalidate cache when data changes
  static async invalidateStreamCache(jamId: string) {
    try {
      const keys = [
        REDIS_KEYS.STREAM_QUEUE(jamId),
        REDIS_KEYS.ACTIVE_STREAM(jamId),
      ];
      await Promise.all(keys.map(key => redis.del(key)));
      console.log(`✅ Cache invalidated for jam: ${jamId}`);
    } catch (error) {
      console.error('Error invalidating stream cache:', error);
    }
  }

  // Publish real-time updates
  static async publishVoteUpdate(jamId: string, streamId: string, voteData: any) {
    try {
      const channel = REDIS_KEYS.VOTE_UPDATES(jamId);
      await redis.publish(channel, JSON.stringify({ streamId, ...voteData }));
      console.log(`✅ Published vote update for jam: ${jamId}`);
    } catch (error) {
      console.error('Error publishing vote update:', error);
    }
  }

  static async publishStreamUpdate(jamId: string, updateData: any) {
    try {
      const channel = REDIS_KEYS.STREAM_UPDATES(jamId);
      await redis.publish(channel, JSON.stringify(updateData));
      console.log(`✅ Published stream update for jam: ${jamId}`);
    } catch (error) {
      console.error('Error publishing stream update:', error);
    }
  }
}