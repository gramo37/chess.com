import { WebSocket } from "ws";
import {
  GAMENOTFOUND,
  INIT_GAME,
  MOVE,
  BLACK,
  WHITE,
  IN_PROGRESS,
  ENDGAME,
  OFFER_DRAW,
  REJECT_DRAW,
} from "./constants";
import { Game } from "./Game";
import { Player } from "./Player";
import { sendMessage } from "./utils";
import { extractUser } from "./auth";
import { db } from "./db";
import { TMove } from "./types/game.types";
import { TEndGamePayload } from "./types";
import { seedBoard } from "./utils/game";

export class GameManager {
  private games: Game[];
  private pendingUser: Player | null;
  private users: Player[];

  constructor() {
    this.games = [];
    this.pendingUser = null;
    this.users = [];
  }

  async addUser(socket: WebSocket, token: string) {
    this.addHandlers(socket, token);
  }

  async getUsers() {
    return this.users;
  }

  addHandlers(socket: WebSocket, token: string) {
    const self = this;
    socket.on("message", async function connection(data) {
      const message = JSON.parse(data.toString());
      switch (message?.type) {
        case INIT_GAME:
          await self.initGame(socket, token);
          break;
        case MOVE:
          await self.makeMove(socket, message.move);
          break;
        case ENDGAME:
          await self.endGame(socket, message.payload);
          break;
        case OFFER_DRAW:
          await self.offerDraw(socket);
          break;
        case REJECT_DRAW:
          await self.rejectDraw(socket);
          break;
        default:
          break;
      }
    });
  }

  removeUser(socket: WebSocket) {
    this.users = this.users.filter((user) => user.getPlayerSocket() !== socket);
  }

  async offerDraw(socket: WebSocket) {
    const game = this.games.find(
      (game) =>
        (game.getPlayer1().getPlayer() === socket ||
          game.getPlayer2().getPlayer() === socket) &&
        game.getGameStatus() === IN_PROGRESS
    );
    if (game) {
      const opponent =
        game.getPlayer1().getPlayer() === socket
          ? game.getPlayer2()
          : game.getPlayer1();
      sendMessage(opponent.getPlayer(), {
        type: OFFER_DRAW,
      });
    } else
      sendMessage(socket, {
        type: GAMENOTFOUND,
      });
  }

  async rejectDraw(socket: WebSocket) {
    const game = this.games.find(
      (game) =>
        (game.getPlayer1().getPlayer() === socket ||
          game.getPlayer2().getPlayer() === socket) &&
        game.getGameStatus() === IN_PROGRESS
    );
    if (game) {
      // Send Message to the opponent socket
      const opponent =
        game.getPlayer1().getPlayer() === socket
          ? game.getPlayer2()
          : game.getPlayer1();
      sendMessage(opponent.getPlayer(), {
        type: REJECT_DRAW,
      });
    } else
      sendMessage(socket, {
        type: GAMENOTFOUND,
      });
  }

  async endGame(socket: WebSocket, payload: TEndGamePayload) {
    const game = this.games.find(
      (game) =>
        (game.getPlayer1().getPlayer() === socket ||
          game.getPlayer2().getPlayer() === socket) &&
        game.getGameStatus() === IN_PROGRESS
    );
    if (game) {
      await game.endGame(socket, payload);
    } else
      sendMessage(socket, {
        type: GAMENOTFOUND,
      });
  }

  async initGame(socket: WebSocket, token: string) {
    const user = await extractUser(token);
    if (!user || !user.name || !user.id) return;
    // Check for pending games in db
    let db_game = await db.game.findFirst({
      where: {
        OR: [{ blackPlayerId: user.id }, { whitePlayerId: user.id }],
        status: IN_PROGRESS,
      },
    });
    if (db_game) {
      // Check for the game locally
      const game = this.games.find((item) => item.getGameId() === db_game?.id);
      if (game) {
        const restartedPlayer =
          game.getPlayer1().getPlayerId() === user.id
            ? game.getPlayer1()
            : game.getPlayer2();
        restartedPlayer.setPlayerSocket(socket);
        await game.createGame();
        return;
      }
      return;
    }
    // Create a new game if no ongoing game found
    if (this.pendingUser === null) {
      const player = new Player(socket, WHITE, token, user.name, user.id);
      this.pendingUser = player;
      this.users.push(player);
    } else {
      const player = new Player(socket, BLACK, token, user.name, user.id);
      // Avoid creating game between the same player.
      // Eg -> When a player opens the same link in the same browser
      if (this.pendingUser.getPlayerId() !== user.id) {
        this.users.push(player);
        const game = new Game(this.pendingUser, player);
        await game.createGame();
        this.games.push(game);
        this.pendingUser = null;
      }
    }
  }

  async makeMove(socket: WebSocket, move: TMove) {
    const game = this.games.find(
      (game) =>
        (game.getPlayer1().getPlayer() === socket ||
          game.getPlayer2().getPlayer() === socket) &&
        game.getGameStatus() === IN_PROGRESS
    );
    if (game) {
      await game.makeMove(socket, move);
    } else
      sendMessage(socket, {
        type: GAMENOTFOUND,
      });
  }

  addGames(games: any) {
    games.forEach((game: any) => {
      const player1 = new Player(
        null,
        BLACK,
        null,
        game.blackPlayer.name,
        game.blackPlayer.id
      );
      const player2 = new Player(
        null,
        WHITE,
        null,
        game.whitePlayer.name,
        game.whitePlayer.id
      );
      this.users.push(player1);
      this.users.push(player2);
      const newGame = new Game(player2, player1, game.id, game.status);
      const chess = seedBoard(game.Move.map((move: TMove) => ({ from: move.from, to: move.to, promotion: move?.promotion })))
      newGame.setboard(chess.fen());
      newGame.setMoves(
        game.Move.map((move: TMove) => ({ from: move.from, to: move.to, promotion: move?.promotion }))
      );
      newGame.setSans(
        game.Move.map((move: TMove & { san: string }) => move.san)
      );
      this.games.push(newGame);
    });
  }

  initServer() {
    // Get all ongoing games
    db.game
      .findMany({
        where: {
          status: "IN_PROGRESS",
        },
        select: {
          board: true,
          Move: {
            select: {
              from: true,
              to: true,
              san: true,
              promotion: true
            },
          },
          id: true,
          status: true,
          blackPlayer: true,
          whitePlayer: true,
        },
      })
      .then((games: any) => {
        this.addGames(games);
      }).catch((err: any) => {
        console.log(err)
      });
  }
}
