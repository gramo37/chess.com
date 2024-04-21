import { WebSocket } from "ws";
import { GAMENOTFOUND, INIT_GAME, MOVE, BLACK, WHITE } from "./constants";
import { Game, TMove } from "./Game";
import { Player } from "./Player";
import { sendMessage } from "./utils";

export class GameManager {
  private games: Game[];
  private pendingUser: Player | null;
  private users: WebSocket[];

  constructor() {
    this.games = [];
    this.pendingUser = null;
    this.users = [];
  }

  addUser(socket: WebSocket) {
    this.users.push(socket);
    this.addHandlers(socket);
  }

  removeUser(socket: WebSocket) {
    this.users = this.users.filter((user) => user !== socket);
  }

  initGame(socket: WebSocket) {
    if (this.pendingUser === null) {
      const player = new Player(socket, WHITE);
      this.pendingUser = player;
    } else {
      // Create a game between pendingUser and socket
      const player = new Player(socket, BLACK);
      const game = new Game(this.pendingUser, player);
      this.games.push(game);
      this.pendingUser = null;
    }
  }

  makeMove(socket: WebSocket, move: TMove) {
    const game = this.games.find(
      (game) =>
        game.getPlayer1().getPlayer() === socket ||
        game.getPlayer2().getPlayer() === socket
    );
    if (game) game.makeMove(socket, move);
    else
      sendMessage(socket, {
        type: GAMENOTFOUND,
      });
  }

  addHandlers(socket: WebSocket) {
    const self = this;
    socket.on("message", function connection(data) {
      const message = JSON.parse(data.toString());
      switch (message?.type) {
        case INIT_GAME:
          self.initGame(socket);
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
