export const REDIS_KEYS = {
  // Stream queue cache - expires every 60 seconds
  STREAM_QUEUE: (jamId: string) => `queue:${jamId}`,
  
  // Active stream cache - expires every 60 seconds
  ACTIVE_STREAM: (jamId: string) => `active:${jamId}`,
  
  // Vote counts cache - expires every 10 seconds
  VOTE_COUNTS: (streamId: string) => `votes:${streamId}`,
  
  // User vote status cache - expires every 30 seconds
  USER_VOTES: (userId: string, jamId: string) => `user_votes:${userId}:${jamId}`,
  
  // 🔥 NEW: Video preview cache - expires every 24 hours
  VIDEO_PREVIEW: (videoId: string) => `preview:${videoId}`,
  
  // Real-time vote updates - pub/sub channels
  VOTE_UPDATES: (jamId: string) => `vote_updates:${jamId}`,
  STREAM_UPDATES: (jamId: string) => `stream_updates:${jamId}`,

  // 🔥 NEW: Dashboard cache keys
  USER_PROFILE: (userId: string) => `user_profile:${userId}`,
  USER_JAMS_LIST: (userId: string) => `user_jams_list:${userId}`,
  JAM_STATS: (jamId: string) => `jam_stats:${jamId}`,
  USER_DASHBOARD: (userId: string) => `user_dashboard:${userId}`,
};

export const CACHE_TTL = {
  STREAM_QUEUE: 10, // 10 seconds (reduced from 60 for faster vote updates)
  ACTIVE_STREAM: 10, // 10 seconds (reduced from 60 for faster vote updates)
  VOTE_COUNTS: 5, // 5 seconds (reduced from 10 for faster vote updates)
  USER_VOTES: 10, // 10 seconds (reduced from 30 for faster vote updates)
  VIDEO_PREVIEW: 86400, // 24 hours (video metadata rarely changes)

  // 🔥 NEW: Dashboard cache TTLs
  USER_PROFILE: 86400,      // 30 minutes - user profile data
  USER_JAMS_LIST: 1800,     // 5 minutes - user's jam list
  JAM_STATS: 300,           // 1 minute - jam statistics (songs, likes)
  USER_DASHBOARD: 300,     // 5 minutes - complete dashboard data
};