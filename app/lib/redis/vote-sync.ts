import redis from './client';
import { REDIS_KEYS, CACHE_TTL } from './keys';

/**
 * VoteSyncService - Handles vote synchronization across multiple users
 * This service ensures that votes are properly synchronized and cached
 * to prevent race conditions and inconsistent vote counts.
 */
export class VoteSyncService {
  
  /**
   * Records a vote action with timestamp for conflict resolution
   */
  static async recordVoteAction(jamId: string, streamId: string, userId: string, action: 'upvote' | 'downvote' | 'remove_upvote' | 'remove_downvote') {
    try {
      const voteRecord = {
        jamId,
        streamId,
        userId,
        action,
        timestamp: Date.now()
      };
      
      const key = `vote_action:${jamId}:${streamId}:${userId}`;
      // Store vote action for 60 seconds to handle conflicts
      await redis.setEx(key, 60, JSON.stringify(voteRecord));
      
      console.log(`✅ Recorded vote action: ${action} by ${userId} on stream ${streamId}`);
    } catch (error) {
      console.error('Error recording vote action:', error);
    }
  }

  /**
   * Publishes vote updates to all clients listening to this jam
   */
  static async broadcastVoteUpdate(jamId: string, streamId: string, voteData: any) {
    try {
      const updateMessage = {
        type: 'vote_update',
        jamId,
        streamId,
        ...voteData,
        timestamp: Date.now()
      };
      
      const channel = REDIS_KEYS.VOTE_UPDATES(jamId);
      await redis.publish(channel, JSON.stringify(updateMessage));
      
      console.log(`✅ Broadcasted vote update for jam: ${jamId}, stream: ${streamId}`);
    } catch (error) {
      console.error('Error broadcasting vote update:', error);
    }
  }

  /**
   * Invalidates all vote-related caches for a jam to ensure consistency
   */
  static async invalidateVoteCaches(jamId: string) {
    try {
      // Get all user vote cache keys for this jam
      const userVotePattern = `user_votes:*:${jamId}`;
      const userVoteKeys = await redis.keys(userVotePattern);
      
      // Get stream cache keys
      const streamKeys = [
        REDIS_KEYS.STREAM_QUEUE(jamId),
        REDIS_KEYS.ACTIVE_STREAM(jamId)
      ];
      
      // Combine all keys to delete
      const allKeys = [...streamKeys, ...userVoteKeys];
      
      if (allKeys.length > 0) {
        await Promise.all(allKeys.map((key: string) => redis.del(key)));
        console.log(`✅ Invalidated ${allKeys.length} vote-related caches for jam: ${jamId}`);
      }
    } catch (error) {
      console.error('Error invalidating vote caches:', error);
    }
  }

  /**
   * Forces immediate cache refresh after vote to prevent stale data
   */
  static async forceVoteSync(jamId: string, streamId: string, userId: string, voteAction: any) {
    try {
      // 1. Record the vote action
      await this.recordVoteAction(jamId, streamId, userId, voteAction.type);
      
      // 2. Invalidate all related caches
      await this.invalidateVoteCaches(jamId);
      
      // 3. Broadcast the update to all clients
      await this.broadcastVoteUpdate(jamId, streamId, voteAction);
      
      console.log(`✅ Force synced vote for jam: ${jamId}, stream: ${streamId}`);
    } catch (error) {
      console.error('Error in force vote sync:', error);
    }
  }

  /**
   * Gets the latest vote state for debugging/monitoring
   */
  static async getVoteDebugInfo(jamId: string) {
    try {
      const pattern = `vote_action:${jamId}:*`;
      const keys = await redis.keys(pattern);
      
      const voteActions = await Promise.all(
        keys.map(async (key: string) => {
          const data = await redis.get(key);
          return data ? JSON.parse(data) : null;
        })
      );
      
      return voteActions.filter(action => action !== null);
    } catch (error) {
      console.error('Error getting vote debug info:', error);
      return [];
    }
  }
}
