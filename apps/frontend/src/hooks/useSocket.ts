import { useEffect, useState } from "react";
import { WS_URL } from "../constants/routes";
import { usePersonStore } from "../contexts/auth";

export const useSocket = () => {
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const user = usePersonStore((state) => state.user);

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
  }, [user?.token]);

  return socket;
};
