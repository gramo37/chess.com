import { useEffect } from "react";
import { RESIGN } from "../constants";
import { useGameStore } from "../contexts/game.context";

const useGameResult = () => {
  const { isGameStarted, color, result } = useGameStore([
    "isGameStarted",
    "color",
    "result",
  ]);

  useEffect(() => {
    if (result?.gameResult === RESIGN && result.winner === color) {
      alert("Congrats. You Won. Opponent has resigned");
    } else if (["DRAW", "ACCEPT_DRAW"].includes(result?.gameResult ?? "")) {
      alert("Game is Drawn!");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isGameStarted, result]);
};

export default useGameResult;
