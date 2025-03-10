import { useInitSocket } from "../hooks/useSocket";
import Moves from "../components/game/Moves";
import { useGameStore } from "../contexts/game.context";
import NewGame from "../components/game/NewGame";
import { ACCEPT_DRAW, DRAW } from "../constants";
import { formatTime } from "../utils/game";
import Chessboard from "../components/game/Chessboard";
import useGamelogic from "../hooks/useGameLogic";

export default function Game() {
  const { isGameStarted, color, result, opponent, player } = useGameStore([
    "isGameStarted",
    "color",
    "result",
    "opponent",
    "player",
  ]);
  useInitSocket();

  const {
    loading,
    setLoading,
    player2timeLeft,
    player1timeLeft
  } = useGamelogic();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900 p-0 sm:p-4">
      <div className="flex flex-col lg:flex-row bg-gray-800 rounded-lg shadow-lg overflow-hidden w-full sm:w-[70%] lg:w-[85%] max-w-7xl">
        <div className="w-full lg:w-1/2 p-4 lg:p-8 flex flex-col items-center">
          <div className="mb-4 text-center">
            <h2 className="text-xl font-bold text-gray-300">
              {opponent?.name ?? ""}
            </h2>
            <p className="text-gray-400">
              Time left:{" "}
              {color === "white"
                ? formatTime(player2timeLeft)
                : formatTime(player1timeLeft)}
            </p>
          </div>
          <Chessboard setLoading={setLoading}/>
          <div className="mt-4 text-center">
            <h2 className="text-xl font-bold text-gray-300">
              {player?.name ?? ""}
            </h2>
            <p className="text-gray-400">
              Time left:{" "}
              {color === "white"
                ? formatTime(player1timeLeft)
                : formatTime(player2timeLeft)}
            </p>
          </div>
        </div>
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
          <div className="hidden">{loading}</div>
          {!isGameStarted && <NewGame />}
          {isGameStarted && <Moves />}
        </div>
      </div>
    </div>
  );
}
