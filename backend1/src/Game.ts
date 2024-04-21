import { Chess } from "chess.js";
import { WebSocket } from "ws";
import { Player } from "./Player";
import { sendMessage } from "./utils";
import {
  GAMEOVER,
  GAMESTARTED,
  INVALID_MOVE,
  MOVESUCCESS,
  WHITE,
  BLACK,
} from "./constants";

export type TMove = {
  from: string;
  to: string;
};

export class Game {
  private player1: Player;
  private player2: Player;
  private board: string;
  private moves: TMove[];
  private moveCount: number;
  private startTime: Date;

  constructor(player1: Player, player2: Player) {
    this.player1 = player1;
    this.player2 = player2;
    this.board = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";
    this.moves = [];
    this.moveCount = 0;
    this.startTime = new Date();

    sendMessage(this.player1.getPlayer(), {
      type: GAMESTARTED,
      payload: {
        color: WHITE,
      },
    });
    sendMessage(this.player2.getPlayer(), {
      type: GAMESTARTED,
      payload: {
        color: BLACK,
      },
    });
  }

  getPlayer1() {
    return this.player1;
  }

  getPlayer2() {
    return this.player2;
  }

  makeMove(socket: WebSocket, move: TMove) {
    const player1 = this.player1.getPlayer();
    const player2 = this.player2.getPlayer();
    // Validate the move
    // 1: Player1 is making the move when moveCount is even and vice versa
    if (this.moveCount % 2 === 0 && socket === player2) {
      sendMessage(socket, {
        type: INVALID_MOVE,
        payload: {
          message: "Please wait for your turn!",
        },
      });
      return;
    }
    if (this.moveCount % 2 === 1 && socket === player1) {
      sendMessage(socket, {
        type: INVALID_MOVE,
        payload: {
          message: "Please wait for your turn!",
        },
      });
      return;
    }

    // 2: The move is valid according to chess rules
    const chess = new Chess(this.board);
    try {
      chess.move(move);
    } catch (e) {
      console.log(e);
      sendMessage(socket, {
        type: INVALID_MOVE,
        payload: {
          message: e,
        },
      });
      return;
    }

    // Make the move
    this.moves.push(move);
    this.board = chess.fen();

    sendMessage(player2, {
      type: MOVESUCCESS,
      payload: {
        board: this.board,
        moves: this.moves,
      },
    });

    sendMessage(player1, {
      type: MOVESUCCESS,
      payload: {
        board: this.board,
        moves: this.moves,
      },
    });

    // Check for draw or checkmate
    if (chess.isGameOver()) {
      if (socket === player1) {
        sendMessage(player1, {
          type: GAMEOVER,
          payload: {
            winner: this.player1.getPlayerColor(),
            loser: this.player2.getPlayerColor(),
          },
        });
        sendMessage(player2, {
          type: GAMEOVER,
          payload: {
            winner: this.player1.getPlayerColor(),
            loser: this.player2.getPlayerColor(),
          },
        });
      } else {
        sendMessage(player1, {
          type: GAMEOVER,
          payload: {
            winner: this.player2.getPlayerColor(),
            loser: this.player1.getPlayerColor(),
          },
        });
        sendMessage(player2, {
          type: GAMEOVER,
          payload: {
            winner: this.player2.getPlayerColor(),
            loser: this.player1.getPlayerColor(),
          },
        });
      }
    }

    this.moveCount += 1;
  }
}
