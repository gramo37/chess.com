import { Chess } from "chess.js";
import { WebSocket } from "ws";
import { Player } from "./Player";
import { broadCastMessage, sendGameOverMessage, sendMessage } from "./utils";
import {
  GAMEOVER,
  GAMESTARTED,
  INVALID_MOVE,
  MOVESUCCESS,
  WHITE,
  BLACK,
  IN_PROGRESS,
  NOT_YET_STARTED,
  GAMERESTARTED,
  COMPLETED,
  WHITE_WINS,
  BLACK_WINS,
  DRAW,
  CHECKMATE,
  ACCEPT_DRAW,
} from "./constants";
import { db } from "./db";
import { randomUUID } from "crypto";
import { TGameStatus, TMove } from "./types/game.types";
import { TEndGamePayload } from "./types";

export class Game {
  private player1: Player;
  private player2: Player;
  private board: string;
  private moves: TMove[];
  private sans: String[];
  private moveCount: number;
  private startTime: Date;
  private gameId: string;
  private status: TGameStatus;
  private chess: Chess;

  constructor(
    player1: Player,
    player2: Player,
    gameId?: string,
    status?: TGameStatus
  ) {
    this.player1 = player1;
    this.player2 = player2;
    this.board = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";
    this.moves = [];
    this.sans = [];
    this.moveCount = 0;
    this.startTime = new Date();
    this.gameId = gameId ?? randomUUID();
    this.status = status ?? NOT_YET_STARTED;
    this.chess = new Chess();
  }

  getPlayer1() {
    return this.player1;
  }

  getPlayer2() {
    return this.player2;
  }

  getGameId() {
    return this.gameId;
  }

  getGameStatus() {
    return this.status;
  }

  setPlayer1(player: Player) {
    this.player1 = player;
  }

  setPlayer2(player: Player) {
    this.player2 = player;
  }

  setMoves(moves: TMove[]) {
    this.moves = moves;
    this.moveCount = moves?.length;
  }

  setSans(sans: String[]) {
    this.sans = sans;
  }

  setboard(board: string) {
    this.board = board;
  }

  async makeMove(socket: WebSocket, move: TMove) {
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
    const chess = this.chess;
    let san = ""
    try {
      const { san: _san } = chess.move(move);
      san = _san;
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
    this.sans.push(san);
    this.board = chess.fen();

    // Update the move in DB
    await db.$transaction([
      db.move.create({
        data: {
          Game: {
            connect: {
              id: this.gameId,
            },
          },
          moveNumber: this.moveCount + 1,
          from: move.from,
          to: move.to,
          san
        },
      }),
      db.game.update({
        data: {
          board: this.board,
        },
        where: {
          id: this.gameId,
        },
      }),
    ]);

    broadCastMessage([player1, player2], {
      type: MOVESUCCESS,
      payload: {
        board: this.board,
        moves: this.moves,
        sans: this.sans
      },
    });

    // Check for draw or checkmate
    let result: "WHITE_WINS" | "BLACK_WINS" | "DRAW" | null = null;
    if (chess.isGameOver()) {
      const winner =
        this.player1.getPlayer() === socket ? this.player1 : this.player2;
      const loser =
        this.player1.getPlayer() === socket ? this.player2 : this.player1;
      result = sendGameOverMessage(winner, loser, CHECKMATE);
    }

    if (chess.isDraw() || chess.isThreefoldRepetition()) {
      broadCastMessage([player1, player2], {
        type: GAMEOVER,
        payload: {
          winner: null,
          loser: null,
          status: COMPLETED,
          result: DRAW,
        },
      });
      result = DRAW;
    }

    // Update the result of game in DB
    if (result) {
      await db.game.update({
        data: {
          status: COMPLETED,
          result,
          gameOutCome: result === DRAW ? DRAW : CHECKMATE,
        },
        where: {
          id: this.gameId,
        },
      });
      this.status = COMPLETED;
      return;
    }

    this.moveCount += 1;
  }

  async createGame() {
    if (this.status === NOT_YET_STARTED) {
      const db_game = await db.game.create({
        data: {
          status: IN_PROGRESS,
          whitePlayer: {
            connect: {
              id: this.player1.getPlayerId(),
            },
          },
          blackPlayer: {
            connect: {
              id: this.player2.getPlayerId(),
            },
          },
        },
      });
      this.gameId = db_game.id;
      this.status = IN_PROGRESS;
      sendMessage(this.player1.getPlayer(), {
        type: GAMESTARTED,
        payload: {
          color: this.gameId ? this.player1.getPlayerColor() : WHITE,
        },
      });

      sendMessage(this.player2.getPlayer(), {
        type: GAMESTARTED,
        payload: {
          color: this.gameId ? this.player2.getPlayerColor() : BLACK,
        },
      });

      return;
    }
    sendMessage(this.player1.getPlayer(), {
      type: GAMERESTARTED,
      payload: {
        board: this.board,
        moves: this.moves,
        color: this.gameId ? this.player1.getPlayerColor() : WHITE,
        sans: this.sans
      },
    });

    sendMessage(this.player2.getPlayer(), {
      type: GAMERESTARTED,
      payload: {
        board: this.board,
        moves: this.moves,
        color: this.gameId ? this.player2.getPlayerColor() : BLACK,
        sans: this.sans
      },
    });
  }

  async endGame(socket: WebSocket, payload: TEndGamePayload) {
    const winner =
      this.player1.getPlayer() === socket ? this.player2 : this.player1;
    const loser =
      this.player1.getPlayer() === socket ? this.player1 : this.player2;
    let result: "WHITE_WINS" | "BLACK_WINS" | "DRAW" = sendGameOverMessage(
      winner,
      loser,
      payload.status
    );
    if (payload.status === ACCEPT_DRAW) result = DRAW;
    if (result) {
      await db.game.update({
        data: {
          status: COMPLETED,
          result,
          gameOutCome: payload.status,
        },
        where: {
          id: this.gameId,
        },
      });
      this.status = COMPLETED;
    }
  }
}
