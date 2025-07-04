import { createClient } from 'redis';

export const redis = createClient({
    username: process.env.REDIS_USERNAME || 'default',
    password: process.env.REDIS_PASSWORD || '',
    socket: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379'),
        // Remove TLS - your Redis Cloud instance doesn't use it
        connectTimeout: 10000,
        keepAlive: true,
    }
});

redis.on('error', (err) => {
    console.error('Redis Client Error:', err);
});

redis.on('connect', () => {
    console.log(`✅ Redis Connected to: ${process.env.REDIS_HOST}:${process.env.REDIS_PORT}`);
});

redis.on('ready', () => {
    console.log('✅ Redis Ready');
});

redis.on('reconnecting', () => {
    console.log('🔄 Redis Reconnecting...');
});

redis.on('end', () => {
    console.log('🔴 Redis Connection Ended');
});

// Connect with better error handling
const connectRedis = async () => {
    try {
        if (!redis.isOpen) {
            await redis.connect();
            console.log('✅ Redis connection established successfully');
        }
    } catch (error) {
        console.error('❌ Failed to connect to Redis:', error);
        // App should still work without Redis (fallback to database)
    }
};

connectRedis();

export default redis;