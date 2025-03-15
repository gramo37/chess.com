import { DRAW, ACCEPT_DRAW } from "../../constants";
import { useGameStore } from "../../contexts/game.context";
import Moves from "./Moves";
import NewGame from "./NewGame";

const GameOptions = () => {
  const { color, result, sendingMove } = useGameStore([
    "color",
    "result",
    "sendingMove",
  ]);
  return (
    <div className="w-full lg:w-1/2 p-4 lg:p-8 flex flex-col items-center">
      <p className="text-center text-gray-400">
        {[DRAW, ACCEPT_DRAW].includes(result?.gameResult ?? "") &&
          "Game is Drawn"}
      </p>
      {![DRAW, ACCEPT_DRAW].includes(result?.gameResult ?? "") && result && (
        <p className="text-center text-gray-400">
          {result.winner === color ? "You Won" : "You Lose"}
        </p>
      )}
      <div className="hidden">{sendingMove}</div>
      <NewGame />
      <Moves />
    </div>
  );
};

export default GameOptions;
