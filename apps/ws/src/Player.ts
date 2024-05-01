import { WebSocket } from "ws";

export class Player {
  private id: string;
  private color: string;
  private player: WebSocket;
  private token: string;
  private name: string;

  constructor(
    socket: WebSocket,
    color: string,
    token: string,
    name: string,
    id: string
  ) {
    this.color = color;
    this.player = socket;
    this.token = token;
    this.name = name;
    this.id = id;
  }

  getPlayer() {
    return this.player;
  }

  getPlayerColor() {
    return this.color;
  }

  getPlayerSocket() {
    return this.player;
  }

  getPlayerToken() {
    return this.token;
  }

  getPlayerName() {
    return this.name;
  }

  getPlayerId() {
    return this.id;
  }
}
