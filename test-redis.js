const { createClient } = require('redis');

const client = createClient({
    username: 'default',
    password: 'R107HcyZGfU8gFwLMoINhUyfSWI9kBs9',
    socket: {
        host: 'redis-14325.c212.ap-south-1-1.ec2.redns.redis-cloud.com',
        port: 14325
    }
});

client.on('error', err => console.log('Redis Client Error', err));
client.on('connect', () => console.log('✅ Connected!'));

async function testRedis() {
    try {
        await client.connect();
        await client.set('test-key', 'working');
        const result = await client.get('test-key');
        console.log('✅ Test result:', result);
        await client.quit();
        console.log('✅ Connection closed successfully');
    } catch (error) {
        console.error('❌ Error:', error);
    }
}

testRedis();