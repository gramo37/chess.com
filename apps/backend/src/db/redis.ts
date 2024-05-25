import { createClient } from 'redis';
import { db } from '.';

const REDIS_KEY = process.env.REDIS_KEY ?? "REDIS_KEY";
const REDIS_DATA_KEY = process.env.REDIS_DATA_KEY ?? "data";

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

export const sendMovesToDB = async () => {
    try {
        console.log("Sending moves to DB")
        const games = await client.hGetAll(REDIS_KEY);
        if (!(REDIS_DATA_KEY in games)) {
            console.log("No Moves Found")
            return;
        }
        await client.flushDb();
        const data = JSON.parse(games[REDIS_DATA_KEY])
        let moves = data.moves

        // Bulk create in moves table
        const movesAddedToDB = await db.move.createMany({
            data: moves
        });
        console.log("Moves added to DB: ", movesAddedToDB);
    } catch (error) {
        console.log(error)
    }
}