import { WebSocketServer } from "ws";
import { GameManager } from "./GameManager";
import url from "url";
import { db } from "./db";

const PORT = process.env.WEBSOCKET_PORT ?? 8080;

const wss = new WebSocketServer({ port: +PORT });
const gameManager = new GameManager();

// Get all ongoing games
db.game
  .findMany({
    where: {
      status: "IN_PROGRESS"
    },
    select: {
      board: true,
      Move: {
        select: {
          from: true,
          to: true,
        },
      },
      id: true,
      status: true,
      blackPlayer: true,
      whitePlayer: true,
    },
  })
  .then((games) => {
    gameManager.addGames(games);
  });

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
