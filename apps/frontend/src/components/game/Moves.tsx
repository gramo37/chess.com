import { ABORT_GAME, ENDGAME, OFFER_DRAW, RESIGN } from "../../constants";
import { useGameStore } from "../../contexts/game.context";

const processMoves = (moves: string[]) => {
  const result = [];
  for (let i = 0; i < moves.length; i += 2) {
    result.push({
      white: moves[i],
      black: moves[i + 1] || "", // Handle case where there's no black move
    });
  }
  return result;
};

const Moves = () => {
  const { color, sans, socket, result } = useGameStore([
    "color",
    "socket",
    "sans",
    "isGameStarted",
    "result",
  ]);
  const processedMoves = processMoves(sans);

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

  const abortGame = () => {
    socket?.send(
      JSON.stringify({
        type: ABORT_GAME,
      })
    );
  };

  return (
    <>
      {!result?.gameResult && (
        <p className="text-center text-gray-400">
          {color ? `You are playing ${color}` : `Finding opponent...`}
        </p>
      )}
      <div className="hidden md:block mt-4 w-full">
        <h3 className="text-lg font-medium text-gray-300">Moves:</h3>
        <div className="overflow-y-auto h-48 border border-gray-700 p-2 w-full min-h-[315px]">
          <ul className="list-disc list-inside">
            <tr>
              <td className="border border-gray-800 px-4 py-2 text-white">
                White
              </td>
              <td className="border border-gray-800 px-4 py-2 text-white">
                Black
              </td>
            </tr>
            {processedMoves?.map((move, index) => (
              <tr key={index}>
                <td className="border border-gray-800 px-4 py-2 text-white">
                  {move.white}
                </td>
                <td className="border border-gray-800 px-4 py-2 text-white">
                  {move.black}
                </td>
              </tr>
            ))}
          </ul>
        </div>
      </div>
      {color && (
        <>
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
      )}
      {!color && (
        <button
          onClick={abortGame}
          className="w-full bg-yellow-700 text-gray-300 py-2 px-4 rounded mt-4 hover:bg-yellow-600 focus:outline-none focus:bg-yellow-600"
        >
          Abort
        </button>
      )}
    </>
  );
};

export default Moves;
