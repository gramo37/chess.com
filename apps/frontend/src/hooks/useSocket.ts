import { useEffect } from "react";
import { WS_URL } from "../constants/routes";
import { usePersonStore } from "../contexts/auth";
import { useGameStore } from "../contexts/game.context";

export const useInitSocket = () => {
  const { user } = usePersonStore(["user"]);
  const { setSocket } = useGameStore(["setSocket"]);

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
};
