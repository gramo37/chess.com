import { createClient } from 'redis';

export const client = createClient({
    socket: {
        host: process.env.REDIS_HOST || 'redis',
        port: parseInt(process.env.REDIS_PORT || '6379', 10)
    }
});

export const connect = () => {
    client.connect().then(() => {
        console.log("Connected to Redis")
    });
    client.on('error', (err: any) => console.log('Redis Client Error', err));
}