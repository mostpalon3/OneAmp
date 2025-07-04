import redis from './client';
import { REDIS_KEYS, CACHE_TTL } from '@/app/lib/redis/keys';

export class StreamCacheService {
  // Cache stream queue
  static async cacheStreamQueue(jamId: string, streams: any[]) {
    const key = REDIS_KEYS.STREAM_QUEUE(jamId);
    await redis.setEx(key, CACHE_TTL.STREAM_QUEUE, JSON.stringify(streams));
  }

  // Get cached stream queue
  static async getCachedStreamQueue(jamId: string) {
    const key = REDIS_KEYS.STREAM_QUEUE(jamId);
    const cached = await redis.get(key);
    return cached ? JSON.parse(cached) : null;
  }

  // Cache active stream
  static async cacheActiveStream(jamId: string, stream: any) {
    const key = REDIS_KEYS.ACTIVE_STREAM(jamId);
    await redis.setEx(key, CACHE_TTL.ACTIVE_STREAM, JSON.stringify(stream));
  }

  // Get cached active stream
  static async getCachedActiveStream(jamId: string) {
    const key = REDIS_KEYS.ACTIVE_STREAM(jamId);
    const cached = await redis.get(key);
    return cached ? JSON.parse(cached) : null;
  }

  // Cache vote counts for a stream
  static async cacheVoteCounts(streamId: string, upvotes: number, downvotes: number) {
    const key = REDIS_KEYS.VOTE_COUNTS(streamId);
    await redis.setEx(key, CACHE_TTL.VOTE_COUNTS, JSON.stringify({ upvotes, downvotes }));
  }

  // Get cached vote counts
  static async getCachedVoteCounts(streamId: string) {
    const key = REDIS_KEYS.VOTE_COUNTS(streamId);
    const cached = await redis.get(key);
    return cached ? JSON.parse(cached) : null;
  }

  // Cache user votes for a jam
  static async cacheUserVotes(userId: string, jamId: string, votes: { upvotes: string[], downvotes: string[] }) {
    const key = REDIS_KEYS.USER_VOTES(userId, jamId);
    await redis.setEx(key, CACHE_TTL.USER_VOTES, JSON.stringify(votes));
  }

  // Get cached user votes
  static async getCachedUserVotes(userId: string, jamId: string) {
    const key = REDIS_KEYS.USER_VOTES(userId, jamId);
    const cached = await redis.get(key);
    return cached ? JSON.parse(cached) : null;
  }

  // Invalidate cache when data changes
  static async invalidateStreamCache(jamId: string) {
    const keys = [
      REDIS_KEYS.STREAM_QUEUE(jamId),
      REDIS_KEYS.ACTIVE_STREAM(jamId),
    ];
    await Promise.all(keys.map(key => redis.del(key)));
  }

  // Publish real-time updates
  static async publishVoteUpdate(jamId: string, streamId: string, voteData: any) {
    const channel = REDIS_KEYS.VOTE_UPDATES(jamId);
    await redis.publish(channel, JSON.stringify({ streamId, ...voteData }));
  }

  static async publishStreamUpdate(jamId: string, updateData: any) {
    const channel = REDIS_KEYS.STREAM_UPDATES(jamId);
    await redis.publish(channel, JSON.stringify(updateData));
  }
}