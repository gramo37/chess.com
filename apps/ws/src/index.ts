import { WebSocketServer } from "ws";
import { GameManager } from "./GameManager";
import url from "url";

const PORT = process.env.WEBSOCKET_PORT ?? 8080;

const wss = new WebSocketServer({ port: +PORT });
const gameManager = new GameManager();

wss.on("connection", async function connection(ws, req) {
  const token = req?.url ? url.parse(req.url, true).query.token : null;
  if (token && typeof token === "string") {
    await gameManager.addUser(ws, token)
  }
  ws.on("disconnect", () => {
    gameManager.removeUser(ws);
  });
});

console.log("Done");
