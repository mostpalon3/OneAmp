export const REDIS_KEYS = {
  // Stream queue cache - expires every 30 seconds
  STREAM_QUEUE: (jamId: string) => `queue:${jamId}`,
  
  // Active stream cache - expires every 60 seconds
  ACTIVE_STREAM: (jamId: string) => `active:${jamId}`,
  
  // Vote counts cache - expires every 10 seconds
  VOTE_COUNTS: (streamId: string) => `votes:${streamId}`,
  
  // User vote status cache - expires every 30 seconds
  USER_VOTES: (userId: string, jamId: string) => `user_votes:${userId}:${jamId}`,
  
  // Real-time vote updates - pub/sub channels
  VOTE_UPDATES: (jamId: string) => `vote_updates:${jamId}`,
  STREAM_UPDATES: (jamId: string) => `stream_updates:${jamId}`,
};

export const CACHE_TTL = {
  STREAM_QUEUE: 60, // 60 seconds
  ACTIVE_STREAM: 60, // 60 seconds
  VOTE_COUNTS: 10, // 10 seconds
  USER_VOTES: 30, // 30 seconds
};