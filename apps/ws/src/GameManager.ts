import { WebSocket } from "ws";
import { GAMENOTFOUND, INIT_GAME, MOVE, BLACK, WHITE } from "./constants";
import { Game, TMove } from "./Game";
import { Player } from "./Player";
import { sendMessage } from "./utils";
import { extractUser } from "./auth";

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

  addHandlers(socket: WebSocket, token: string) {
    const self = this;
    socket.on("message", async function connection(data) {
      const message = JSON.parse(data.toString());
      switch (message?.type) {
        case INIT_GAME:
          await self.initGame(socket, token);
          break;
        case MOVE:
          self.makeMove(socket, message.move);
          break;
        default:
          break;
      }
    });
  }

  removeUser(socket: WebSocket) {
    this.users = this.users.filter((user) => user.getPlayerSocket() !== socket);
  }

  async initGame(socket: WebSocket, token: string) {
    const user = await extractUser(token);
    if(!user || !user.name || !user.id) return;
    if (this.pendingUser === null) {
      const player = new Player(
        socket,
        WHITE,
        token,
        user.name,
        user.id
      );
      this.pendingUser = player;
      this.users.push(player);
    } else {
      const player = new Player(
        socket,
        BLACK,
        token,
        user.name,
        user.id
      );
      // Avoid creating game between the same player.
      // Eg -> When a player opens the same link in the same browser
      if (this.pendingUser.getPlayerToken() !== player.getPlayerToken()) {
        this.users.push(player);
        const game = new Game(this.pendingUser, player);
        await game.createGame();
        this.games.push(game);
        this.pendingUser = null;
      }
    }
  }

  makeMove(socket: WebSocket, move: TMove) {
    // const socket = player.getPlayerSocket();
    const game = this.games.find(
      (game) =>
        game.getPlayer1().getPlayer() === socket ||
        game.getPlayer2().getPlayer() === socket
    );
    if (game) {
      game.makeMove(socket, move);
    } else
      sendMessage(socket, {
        type: GAMENOTFOUND,
      });
  }
}
