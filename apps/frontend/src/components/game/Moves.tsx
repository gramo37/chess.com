import {
  ENDGAME,
  OFFER_DRAW,
  RESIGN,
} from "../../constants";
import { useGameStore } from "../../contexts/game.context";

const Moves = () => {
  const { color, sans, socket, result } = useGameStore([
    "color",
    "socket",
    "sans",
    "isGameStarted",
    "result",
  ]);

  const OfferDraw = () => {
    socket?.send(
      JSON.stringify({
        type: OFFER_DRAW,
      })
    );
  };

  const resign = () => {
    socket?.send(
      JSON.stringify({
        type: ENDGAME,
        payload: {
          status: RESIGN,
        },
      })
    );
  };

  return (
    <>
      {!result?.gameResult && <p className="text-center text-gray-400">
        {color ? `You are playing ${color}` : `Finding opponent...`}
      </p>}
      <div className="hidden md:block mt-4 w-full">
        <h3 className="text-lg font-medium text-gray-300">Moves:</h3>
        <div className="overflow-y-auto h-48 border border-gray-700 p-2 w-full min-h-[315px]">
          <ul className="list-disc list-inside">
            {sans?.map((move, index) => (
              <li key={index} className="text-gray-400">
                {index % 2 === 0 ? "white" : "black"}: {move}
              </li>
            ))}
          </ul>
        </div>
      </div>
      <button
        onClick={OfferDraw}
        className="w-full bg-yellow-700 text-gray-300 py-2 px-4 rounded mt-4 hover:bg-yellow-600 focus:outline-none focus:bg-yellow-600"
      >
        Offer Draw
      </button>
      <button
        onClick={resign}
        className="w-full bg-red-700 text-gray-300 py-2 px-4 rounded mt-4 hover:bg-red-600 focus:outline-none focus:bg-red-600"
      >
        Resign
      </button>
    </>
  );
};

export default Moves;
