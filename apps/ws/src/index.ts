import http from "http";
import { WebSocketServer } from "ws";
import { GameManager } from "./GameManager";
import url from "url";
import { connect } from "./db/redis";
import dotenv from "dotenv";

const PORT = Number(process.env.WEBSOCKET_PORT ?? 8000);

dotenv.config();

const server = http.createServer((req, res) => {
  const path = req.url?.split("?")[0];
  if (req.method === "GET" && (path === "/health" || path === "/ws")) {
    res.writeHead(200, { "Content-Type": "text/plain" });
    res.end(path === "/health" ? "ok" : "ws server ok");
    return;
  }
  res.writeHead(404);
  res.end();
});

const wss = new WebSocketServer({ server });
const gameManager = new GameManager();
gameManager.initServer();

wss.on("connection", async function connection(ws, req) {
  console.log("New connection from ", req.socket.remoteAddress);
  const token = req?.url ? url.parse(req.url, true).query.token : null;
  if (token && typeof token === "string") {
    await gameManager.addUser(ws, token)
  }
  ws.on("close", () => {
    console.log("Connection closed from ", req.socket.remoteAddress);
    gameManager.removeUser(ws);
  });

  ws.on("error", (error) => {
    console.error("Error from ", req.socket.remoteAddress, error);
  });
});

connect();
server.listen(PORT, () => {
  console.log("Connected to PORT: ", PORT);
});
