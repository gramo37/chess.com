import { WebSocket } from "ws";
import { GAMENOTFOUND, INIT_GAME, MOVE, BLACK, WHITE } from "./constants";
import { Game, TMove } from "./Game";
import { Player } from "./Player";
import { sendMessage } from "./utils";
import { db } from "./db";
import { randomUUID } from "crypto";

export class GameManager {
  private games: Game[];
  private pendingUser: Player | null;
  private users: Player[];
  private currentUsertoken: string;
  private currentUsername: string;
  private currentUserId: string;
  private gameId: string;

  constructor() {
    this.games = [];
    this.pendingUser = null;
    this.users = [];
    this.currentUsertoken = "";
    this.currentUsername = "";
    this.currentUserId = "";
    this.gameId = randomUUID();
  }

  addUser(player: Player, token: string) {
    this.currentUsertoken = token;
    this.currentUsername = player.getPlayerName();
    this.currentUserId = player.getPlayerId();
    this.users.push(player);
    this.addHandlers(player.getPlayerSocket());
  }

  removeUser(socket: WebSocket) {
    this.users = this.users.filter((user) => user.getPlayerSocket() !== socket);
  }

  async initGame(socket: WebSocket) {
    if (this.pendingUser === null) {
      // socket: WebSocket, color: string, token: string, name: string
      const player = new Player(
        socket,
        WHITE,
        this.currentUsertoken,
        this.currentUsername,
        this.currentUserId
      );
      this.pendingUser = player;
    } else {
      // Create a game between pendingUser and socket
      const player = new Player(
        socket,
        BLACK,
        this.currentUsertoken,
        this.currentUsername,
        this.currentUserId
      );
      // Avoid creating game between the same player.
      // Eg -> When a player opens the same link in the same browser
      if (this.pendingUser.getPlayerToken() !== player.getPlayerToken()) {
        const game = new Game(this.pendingUser, player);
        this.games.push(game);
        // Add this game in the database
        const db_game = await db.game.create({
          data: {
            status: "IN_PROGRESS",
            whitePlayer: {
              connect: {
                id: this.pendingUser.getPlayerId(),
              },
            },
            blackPlayer: {
              connect: {
                id: player.getPlayerId(),
              },
            },
          },
        });
        console.log(game);
        this.gameId = db_game.id;
        this.pendingUser = null;
      }
    }
  }

  makeMove(socket: WebSocket, move: TMove) {
    const game = this.games.find(
      (game) =>
        game.getPlayer1().getPlayer() === socket ||
        game.getPlayer2().getPlayer() === socket
    );
    if (game) {
      game.makeMove(socket, move);
      // Add the move in move table
      // Update the board in games table
      
    }
    else
      sendMessage(socket, {
        type: GAMENOTFOUND,
      });
  }

  addHandlers(socket: WebSocket) {
    const self = this;
    socket.on("message", async function connection(data) {
      const message = JSON.parse(data.toString());
      switch (message?.type) {
        case INIT_GAME:
          await self.initGame(socket);
          break;
        case MOVE:
          self.makeMove(socket, message.move);
          break;
        default:
          break;
      }
    });
  }
}
