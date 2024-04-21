import { WebSocket } from "ws";

export const sendMessage = (socket: WebSocket, data: object) => {
    socket.send(JSON.stringify(data));
}