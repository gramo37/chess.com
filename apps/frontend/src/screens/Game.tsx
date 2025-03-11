import { useInitSocket } from "../hooks/useSocket";
import Moves from "../components/game/Moves";
import { useGameStore } from "../contexts/game.context";
import NewGame from "../components/game/NewGame";
import { ACCEPT_DRAW, DRAW } from "../constants";
import Chessboard from "../components/game/Chessboard";
import useGamelogic from "../hooks/useGameLogic";

export default function Game() {
  const { isGameStarted, color, result, sendingMove } = useGameStore([
    "isGameStarted",
    "color",
    "result",
    "sendingMove"
  ]);
  useInitSocket();

  const { player1timeLeft, player2timeLeft } =
    useGamelogic();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900 p-0 sm:p-4">
      <div className="flex flex-col lg:flex-row bg-gray-800 rounded-lg shadow-lg overflow-hidden w-full sm:w-[70%] lg:w-[85%] max-w-7xl">
        <Chessboard
          player1timeLeft={player1timeLeft}
          player2timeLeft={player2timeLeft}
        />
        <div className="w-full lg:w-1/2 p-4 lg:p-8 flex flex-col items-center">
          <p className="text-center text-gray-400">
            {[DRAW, ACCEPT_DRAW].includes(result?.gameResult ?? "") &&
              "Game is Drawn"}
          </p>
          {![DRAW, ACCEPT_DRAW].includes(result?.gameResult ?? "") &&
            result && (
              <p className="text-center text-gray-400">
                {result.winner === color ? "You Won" : "You Lose"}
              </p>
            )}
          <div className="hidden">{sendingMove}</div>
          {!isGameStarted && <NewGame />}
          {isGameStarted && <Moves />}
        </div>
      </div>
    </div>
  );
}
