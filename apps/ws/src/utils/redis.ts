import { client } from "../db/redis";

const REDIS_KEY = process.env.REDIS_KEY ?? "REDIS_KEY";
const REDIS_DATA_KEY = process.env.REDIS_DATA_KEY ?? "data";

type TGame = {
    gameId: string;
    moveNumber: number,
    from: string,
    to: string,
    san: string,
    promotion?: string
}

export const addMoveToRedis = async (game: TGame) => {
    let games = await client.hGetAll(REDIS_KEY);
    if (REDIS_DATA_KEY in games) {
        let data = JSON.parse(games[REDIS_DATA_KEY])
        data.moves.push(game)
        await client.hSet(REDIS_KEY, { [REDIS_DATA_KEY]: JSON.stringify(data) })
    } else {
        await client.hSet(REDIS_KEY, {
            [REDIS_DATA_KEY]: JSON.stringify({ "moves": [game] })
        })
    }
}