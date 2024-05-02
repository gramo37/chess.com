import { WebSocket } from "ws";
import {
  GAMENOTFOUND,
  INIT_GAME,
  MOVE,
  BLACK,
  WHITE,
  IN_PROGRESS,
} from "./constants";
import { Game, TMove } from "./Game";
import { Player } from "./Player";
import { sendMessage } from "./utils";
import { extractUser } from "./auth";
import { db } from "./db";

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
      const game = this.games.find((item) => item.getGameId() === db_game.id);
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
      if (this.pendingUser.getPlayerToken() !== player.getPlayerToken()) {
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
        game.getPlayer2().getPlayer() === socket) && game.getGameStatus() === IN_PROGRESS
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
      newGame.setboard(game.board);
      newGame.setMoves(game.Move);
      this.games.push(newGame);
    });
  }
}
