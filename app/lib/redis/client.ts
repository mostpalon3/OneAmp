import { createClient } from 'redis';

const isProduction = process.env.NODE_ENV === 'production';

export const redis = createClient({
    username: process.env.REDIS_USERNAME || 'default',
    password: process.env.REDIS_PASSWORD || '',
    socket: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379'),
        connectTimeout: isProduction ? 15000 : 10000, // Longer timeout in production
        keepAlive: true,
    }
});

redis.on('error', (err) => {
    console.error('Redis Client Error:', err);
    // In production, you might want to send this to error monitoring
    if (isProduction) {
        // Add error monitoring service like Sentry here
        // sentry.captureException(err);
    }
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

// Graceful shutdown handling
process.on('SIGINT', async () => {
    console.log('Gracefully shutting down Redis connection...');
    await redis.quit();
    process.exit(0);
});

process.on('SIGTERM', async () => {
    console.log('Gracefully shutting down Redis connection...');
    await redis.quit();
    process.exit(0);
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
        if (isProduction) {
            // In production, you might want to implement circuit breaker
            console.log('🔄 Redis unavailable, using database fallback');
        }
    }
};

connectRedis();

export default redis;