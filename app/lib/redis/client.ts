import { createClient } from 'redis';

// Global singleton instance
let redisInstance: ReturnType<typeof createClient> | null = null;
let isConnecting = false;
let connectionAttempts = 0;
const MAX_CONNECTION_ATTEMPTS = 3;

const createRedisClient = () => {
  if (redisInstance) {
    return redisInstance;
  }

  redisInstance = createClient({
    username: process.env.REDIS_USERNAME || 'default',
    password: process.env.REDIS_PASSWORD || '',
    socket: {
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379'),
      connectTimeout: 10000,
      keepAlive: true,
      // 🔥 CRITICAL: Disable automatic reconnection to prevent loop
      reconnectStrategy: (retries) => {
        if (retries > MAX_CONNECTION_ATTEMPTS) {
          console.error('❌ Redis: Max reconnection attempts reached, giving up');
          return false; // Stop reconnecting
        }
        // Exponential backoff to prevent rapid reconnections
        return Math.min(retries * 2000, 10000);
      },
    },
  });

  redisInstance.on('error', (err: any) => {
    console.error('Redis Client Error:', err.message);
    
    if (err.message.includes('max number of clients reached')) {
      console.log('⚠️ Redis connection limit reached, disabling Redis for 30 seconds');
      // Disable Redis temporarily
      setTimeout(() => {
        connectionAttempts = 0;
        console.log('🔄 Redis connection attempts reset');
      }, 30000);
    }
  });

  redisInstance.on('connect', () => {
    console.log(`✅ Redis Connected to: ${process.env.REDIS_HOST}:${process.env.REDIS_PORT}`);
    connectionAttempts = 0; // Reset on successful connection
    isConnecting = false;
  });

  redisInstance.on('ready', () => {
    console.log('✅ Redis Ready');
  });

  redisInstance.on('reconnecting', () => {
    console.log('🔄 Redis Reconnecting...');
  });

  redisInstance.on('end', () => {
    console.log('🔴 Redis Connection Ended');
    isConnecting = false;
  });

  return redisInstance;
};

// Create the singleton instance
const redisClient = createRedisClient();

// 🔥 CRITICAL: Prevent multiple connection attempts
const ensureConnection = async () => {
  // If already connecting, wait
  if (isConnecting) {
    console.log('⏳ Redis connection already in progress, waiting...');
    return;
  }

  // If too many attempts, use database fallback
  if (connectionAttempts >= MAX_CONNECTION_ATTEMPTS) {
    console.log('❌ Redis max attempts reached, using database fallback');
    return;
  }

  try {
    if (!redisClient.isOpen && !isConnecting) {
      isConnecting = true;
      connectionAttempts++;
      
      console.log(`🔄 Attempting Redis connection (${connectionAttempts}/${MAX_CONNECTION_ATTEMPTS})`);
      await redisClient.connect();
      console.log('✅ Redis connection established successfully');
    }
  } catch (error) {
    console.error('❌ Failed to connect to Redis:', error);
    isConnecting = false;
    
    if (connectionAttempts >= MAX_CONNECTION_ATTEMPTS) {
      console.log('💾 Switching to database-only mode for 30 seconds');
    }
  }
};

// 🔥 SAFE Redis wrapper with circuit breaker pattern
export const redis = {
  async get(key: string) {
    try {
      if (connectionAttempts >= MAX_CONNECTION_ATTEMPTS) {
        return null; // Skip Redis, use database
      }
      
      await ensureConnection();
      if (!redisClient.isOpen) return null;
      
      return await redisClient.get(key);
    } catch (error) {
      console.error('Redis GET error:', error);
      return null;
    }
  },

  async setEx(key: string, seconds: number, value: string) {
    try {
      if (connectionAttempts >= MAX_CONNECTION_ATTEMPTS) {
        return null; // Skip Redis caching
      }
      
      await ensureConnection();
      if (!redisClient.isOpen) return null;
      
      return await redisClient.setEx(key, seconds, value);
    } catch (error) {
      console.error('Redis SETEX error:', error);
      return null;
    }
  },

  async del(key: string) {
    try {
      if (connectionAttempts >= MAX_CONNECTION_ATTEMPTS) {
        return null; // Skip Redis deletion
      }
      
      await ensureConnection();
      if (!redisClient.isOpen) return null;
      
      return await redisClient.del(key);
    } catch (error) {
      console.error('Redis DEL error:', error);
      return null;
    }
  },

  async keys(pattern: string) {
    try {
      if (connectionAttempts >= MAX_CONNECTION_ATTEMPTS) {
        return []; // Return empty array if Redis unavailable
      }
      
      await ensureConnection();
      if (!redisClient.isOpen) return [];
      
      return await redisClient.keys(pattern);
    } catch (error) {
      console.error('Redis KEYS error:', error);
      return [];
    }
  },

  async publish(channel: string, message: string) {
    try {
      if (connectionAttempts >= MAX_CONNECTION_ATTEMPTS) {
        return null; // Skip Redis publish
      }
      
      await ensureConnection();
      if (!redisClient.isOpen) return null;
      
      return await redisClient.publish(channel, message);
    } catch (error) {
      console.error('Redis PUBLISH error:', error);
      return null;
    }
  },

  // Health check method
  async ping() {
    try {
      if (connectionAttempts >= MAX_CONNECTION_ATTEMPTS) {
        return null;
      }
      
      await ensureConnection();
      if (!redisClient.isOpen) return null;
      
      return await redisClient.ping();
    } catch (error) {
      console.error('Redis PING error:', error);
      return null;
    }
  },

  // Get connection status
  get isConnected() {
    return redisClient.isOpen && connectionAttempts < MAX_CONNECTION_ATTEMPTS;
  },

  // Manual reset function
  resetConnection() {
    connectionAttempts = 0;
    isConnecting = false;
    console.log('🔄 Redis connection manually reset');
  }
};

// Graceful shutdown
const shutdown = async () => {
  if (redisInstance && redisClient.isOpen) {
    console.log('🔄 Shutting down Redis connection...');
    try {
      await redisClient.quit();
      console.log('✅ Redis connection closed');
    } catch (error) {
      console.error('Error closing Redis connection:', error);
    }
  }
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
process.on('beforeExit', shutdown);

export default redis;