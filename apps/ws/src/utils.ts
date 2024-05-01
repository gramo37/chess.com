import { WebSocket } from "ws";

export const sendMessage = (socket: WebSocket | null, data: object) => {
    if(socket) socket.send(JSON.stringify(data));
}