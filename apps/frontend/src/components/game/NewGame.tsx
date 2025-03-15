import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { COMPLETED, IN_PROGRESS, INIT_GAME } from "../../constants";
import { BACKEND_URL } from "../../constants/routes";
import { useGameStore } from "../../contexts/game.context";
import { useGetGameStatusQuery } from "../../queries/games";
import { usePersonStore } from "../../contexts/auth";

const NewGame = () => {
  const {
    isGameStarted,
    setIsGameStarted,
    setResult,
    socket,
    setColor,
    gameId,
    setBoard
  } = useGameStore([
    "setIsGameStarted",
    "setResult",
    "socket",
    "setColor",
    "isGameStarted",
    "gameId",
    "setBoard"
  ]);
  const { user } = usePersonStore(["user"])
  const { id } = useParams();
  const navigate = useNavigate();
  const { data, isFetching, refetch } = useGetGameStatusQuery(id, {
    refetchOnMountOrArgChange: true,
    refetchOnFocus: true
  });
  const gameStatus = data?.gameData?.status;
  const [isWinner, setIsWinner] = useState<boolean | null>(null)

  useEffect(() => {
    refetch();
  }, [gameId, refetch]);

  useEffect(() => {
    if(!data || !data?.gameData?.board || !user?.id) return;
    setColor(data?.gameData?.blackPlayerId === user?.id ? "black" : "white");
    setBoard(data?.gameData?.board);
    if(
      (data?.gameData?.whitePlayerId === user?.id && data?.gameData?.result === "WHITE_WINS") ||
      (data?.gameData?.blackPlayerId === user?.id && data?.gameData?.result === "BLACk_WINS")
    ) {
      setIsWinner(true);
    } else {
      setIsWinner(false);
    }
  }, [data, data?.gameData?.blackPlayerId, data?.gameData?.board, setBoard, setColor, user?.id])

  const startGame = useCallback(() => {
    if (!socket) return;
    setIsGameStarted(true);
    setResult(null);
    setColor(null);
    socket?.send(
      JSON.stringify({
        type: INIT_GAME,
        payload: {
          gameId: gameStatus === IN_PROGRESS ? id : undefined,
        },
      })
    );
    if(id && gameStatus !== IN_PROGRESS) navigate("/game");
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameStatus, id, setColor, setIsGameStarted, setResult, socket]);

  useEffect(() => {
    // Start the game if game is in progress
    if (id && !isFetching && !isGameStarted && gameStatus === IN_PROGRESS) {
      startGame();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameStatus, id, isFetching, startGame]);

  if (isFetching) return <p>Loading...</p>;

  if (isGameStarted) return null;

  return (
    <div className="flex justify-center items-center flex-col w-full lg:h-[465px]">
      {id && gameStatus === COMPLETED && (
        <p className="text-white text-center m-5">
          Game Over. <br />
          {isWinner ? "You Won!" : "You Lost"}
        </p>
      )}
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
