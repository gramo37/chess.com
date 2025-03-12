import { useInitSocket } from "../hooks/useSocket";
import Chessboard from "../components/game/Chessboard";
import useGamelogic from "../hooks/useGameLogic";
import GameOptions from "../components/game/GameOptions";

export default function Game() {
  useInitSocket();
  useGamelogic();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900 p-0 sm:p-4">
      <div className="flex flex-col lg:flex-row bg-gray-800 rounded-lg shadow-lg overflow-hidden w-full sm:w-[70%] lg:w-[85%] max-w-7xl">
        <Chessboard />
        <GameOptions />
      </div>
    </div>
  );
}
