import { WebSocket } from "ws";
import { Player } from "./Player";
import {
  BLACK_WINS,
  COMPLETED,
  GAMEOVER,
  WHITE,
  WHITE_WINS,
} from "./constants";
import { TGameResult } from "./types/game.types";

export const broadCastMessage = (
  sockets: Array<WebSocket | null> | null,
  data: object
) => {
  if (!sockets) return;
  sockets.forEach((socket) => {
    sendMessage(socket, data);
  });
};

export const sendMessage = (socket: WebSocket | null, data: object) => {
  if (socket) socket.send(JSON.stringify(data));
};

export const sendGameOverMessage = (
  winner: Player,
  loser: Player,
  gameResult: TGameResult
) => {
  broadCastMessage([winner.getPlayer(), loser.getPlayer()], {
    type: GAMEOVER,
    payload: {
      winner: {
        id: winner.getPlayerId(),
        name: winner.getPlayerName(),
        color: winner.getPlayerColor(),
      },
      loser: {
        id: loser.getPlayerId(),
        name: loser.getPlayerName(),
        color: loser.getPlayerColor(),
      },
      status: COMPLETED,
      result: gameResult,
    },
  });
  return winner.getPlayerColor() === WHITE ? WHITE_WINS : BLACK_WINS;
};
