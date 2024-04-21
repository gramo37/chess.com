import { WebSocket } from "ws";

export class Player {
    private color: string;
    private player: WebSocket;

    constructor(socket: WebSocket, color: string) { 
        this.color = color;
        this.player = socket;
    }

    getPlayer() {
        return this.player;
    }

    getPlayerColor() {
        return this.color;
    }
}