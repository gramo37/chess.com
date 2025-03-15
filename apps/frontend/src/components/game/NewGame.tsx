import { INIT_GAME } from "../../constants";
import { BACKEND_URL } from "../../constants/routes";
import { useGameStore } from "../../contexts/game.context";

const NewGame = () => {
  const { isGameStarted, setIsGameStarted, setResult, socket, setColor } = useGameStore([
    "setIsGameStarted",
    "setResult",
    "socket",
    "setColor",
    "isGameStarted"
  ]);
  const startGame = () => {
    if(!socket) return;
    setIsGameStarted(true);
    setResult(null);
    setColor(null);
    socket?.send(
      JSON.stringify({
        type: INIT_GAME,
      })
    );
  };

  if(isGameStarted) return null;

  return (
    <div className="flex justify-center items-center flex-col w-full lg:h-[465px]">
      <button
        disabled={socket === null}
        onClick={startGame}
        className={`w-full bg-blue-700 text-gray-300 py-2 px-4 rounded hover:bg-blue-600 focus:outline-none focus:bg-blue-600 ${socket === null && "bg-gray-500"}`}
      >
        Play
      </button>
      <a
        href={`${BACKEND_URL}/auth/logout`}
        className="w-full bg-gray-700 text-gray-300 py-2 px-4 rounded mt-4 hover:bg-gray-600 focus:outline-none focus:bg-gray-600 text-center"
      >
        Logout
      </a>
    </div>
  );
};

export default NewGame;
