import { WebSocket } from "ws";

export const broadCastMessage = (sockets: Array<WebSocket | null> | null, data: object) => {
    if (!sockets) return;
    sockets.forEach((socket) => {
        sendMessage(socket, data);
    })
}

export const sendMessage = (socket: WebSocket | null, data: object) => {
    if (socket) socket.send(JSON.stringify(data));
}