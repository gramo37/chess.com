import { useEffect, useRef } from "react";
import { WS_URL } from "../constants/routes";
import { usePersonStore } from "../contexts/auth";
import { useGameStore } from "../contexts/game.context";
import { GET_TIME } from "../constants";

export const useInitSocket = () => {
  const { user } = usePersonStore(["user"]);
  const { socket, setSocket } = useGameStore(["setSocket"]);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const ws = new WebSocket(`${WS_URL}?token=${user?.token}`);
    ws.onopen = () => {
      setSocket(ws);
    };

    ws.onclose = () => {
      setSocket(null);
    };

    return () => {
      ws.close();
    };
  }, [setSocket, user?.token]);

  // Context: Websocket automatically turns off after 1 min
  // Sync up with the server
  useEffect(() => {
    intervalRef.current = setInterval(() => {
      if (!socket) return;
      socket.send(
        JSON.stringify({
          type: GET_TIME,
        })
      );
    }, 10000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [socket]);
};
