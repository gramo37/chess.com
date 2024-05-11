import { createClient } from 'redis';

export const client = createClient();

export const connect = () => {
    client.connect().then(() => {
        console.log("Connected to Redis")
    });
    client.on('error', (err: any) => console.log('Redis Client Error', err));
}