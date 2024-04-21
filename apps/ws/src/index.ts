import { WebSocketServer } from 'ws';
import { GameManager } from './GameManager';
import { db } from "./db";

const wss = new WebSocketServer({ port: 8080 });
const gameManager = new GameManager();

wss.on('connection', async function connection(ws) {
  const users = await db.user.findMany();
  console.log("DB Check", users)
  gameManager.addUser(ws);
  ws.on("disconnect", () => {
    gameManager.removeUser(ws)
  })
});

console.log("Done")