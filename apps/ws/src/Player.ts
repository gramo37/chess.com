import { WebSocket } from "ws";

export class Player {
  private id: string;
  private color: string;
  private player: WebSocket | null;
  private token: string | null;
  private name: string;

  constructor(
    socket: WebSocket | null,
    color: string,
    token: string | null,
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

  setPlayerSocket(socket: WebSocket) {
    this.player = socket;
  }

  setPlayerToken(token: string) {
    this.token = token;
  }
}
