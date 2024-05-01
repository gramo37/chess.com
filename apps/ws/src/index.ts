import { WebSocketServer } from 'ws';
import { GameManager } from './GameManager';
import url from "url";
import { extractUser } from './auth';
import { Player } from './Player';
import { WHITE } from './constants';
// import { db } from "./db";

const PORT = process.env.WEBSOCKET_PORT ?? 8080

const wss = new WebSocketServer({ port: +PORT });
const gameManager = new GameManager();

wss.on('connection', async function connection(ws, req) {
  // const users = await db.user.findMany();
  const token = req?.url ? url.parse(req.url, true).query.token : null;
  if(token && typeof token === "string") {
    const user = await extractUser(token);
    gameManager.addUser(new Player(ws, WHITE, token, user?.name ?? "", user?.id ?? ""), token);
  }
  ws.on("disconnect", () => {
    gameManager.removeUser(ws)
  })
});

console.log("Done")