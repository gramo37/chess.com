import { useEffect } from "react";
import { ACCEPT_DRAW, CHECKMATE, RESIGN, DRAW } from "../constants";
import { useGameStore } from "../contexts/game.context";
import { useGlobalStore } from "../contexts/global.context";

const useGameResult = () => {
  const { isGameStarted, color, result } = useGameStore([
    "isGameStarted",
    "color",
    "result",
  ]);
  const { openModal } = useGlobalStore(["openModal"]);

  useEffect(() => {
    if (result?.gameResult && [RESIGN, CHECKMATE].includes(result?.gameResult)) {
      if (result?.winner === color) {
        openModal({
          title: "Congrats!",
          description: `You Won by ${result?.gameResult}`,
        });
      } else {
        openModal({
          title: "Better luck next time!",
          description: `You Lost by ${result?.gameResult}`,
        });
      }
    } else if (result?.gameResult && [DRAW, ACCEPT_DRAW].includes(result?.gameResult ?? "")) {
      openModal({
        title: "Game is Drawn",
        description: "Game is drawn by agreement",
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isGameStarted, result]);
};

export default useGameResult;
