import { Chessboard } from "react-chessboard";
import { useSocket } from "../hooks/useSocket";
import { useEffect, useState } from "react";
import { Square } from "chess.js";
import { Piece } from "react-chessboard/dist/chessboard/types";
import {
  GAMEOVER,
  GAMERESTARTED,
  GAMESTARTED,
  INIT_GAME,
  MOVESUCCESS,
} from "../constants";
import { LOGOUT_URL } from "../constants/routes";
import { useNavigate } from "react-router-dom";
import { usePersonStore } from "../contexts/auth";

type TMove = {
  from: string;
  to: string;
  promotion?: string;
};

export default function Game() {
  const [isGameOn, setIsGameOn] = useState(false);
  const socket = useSocket();
  const [board, setBoard] = useState("");
  const [moves, setMoves] = useState<TMove[]>([]);
  const [color, setColor] = useState<null | "white" | "black">(null);
  const navigate = useNavigate();
  const updateUser = usePersonStore((state) => state.updateUser);
  const [result, setResult] = useState<null | {
    winner: string;
    loser: string;
  }>(null);

  useEffect(() => {
    if (!socket) return;

    socket.onmessage = (event) => {
      const message = JSON.parse(event.data);
      if (message.type === MOVESUCCESS) {
        setBoard(message.payload.board);
        setMoves(message.payload.moves);
      } else if (message.type === GAMESTARTED) {
        setColor(message.payload.color);
        setBoard("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1");
      } else if (message.type === GAMEOVER) {
        setMoves([]);
        setResult({
          winner: message.payload.winner,
          loser: message.payload.loser,
        });
        setIsGameOn(false);
      } else if (message.type === GAMERESTARTED) {
        setBoard(message.payload.board);
        setMoves(message.payload.moves);
        setColor(message.payload.color);
      }
    };

    return () => {
      socket.onmessage = null;
    };
  }, [socket]);

  const startGame = () => {
    setIsGameOn(true);
    setResult(null);
    socket?.send(
      JSON.stringify({
        type: INIT_GAME,
      })
    );
  };

  const makeAMove = (move: TMove) => {
    socket?.send(
      JSON.stringify({
        type: "move",
        move,
      })
    );
  };

  function onDrop(sourceSquare: Square, targetSquare: Square, piece: Piece) {
    // TODO: Create a onPromotionCheck function and send promotion if true
    makeAMove({
      from: sourceSquare,
      to: targetSquare,
    });
    return true;
  }

  async function logout() {
    await fetch(`${LOGOUT_URL}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    });
    updateUser(null);
    navigate("/");
  }

  return (
    <div className="flex border justify-between min-w-96 lg:flex-row flex-col">
      <div className="flex-1 flex max-w-2xl justify-center items-center p-3">
        <Chessboard
          position={board}
          // boardWidth={500}
          onPieceDrop={onDrop}
          boardOrientation={color ?? "white"}
        />
      </div>
      <div className="flex-1 border border-white m-2 flex justify-center items-center min-h-52">
        {isGameOn && (
          <div className="flex-1">
            <div>
              <h1 className="text-center text-white text-2xl font-sans">
                {color ? `You are playing ${color}` : "Finding an Opponent..."}
              </h1>
              {color && (
                <h1 className="text-center text-white text-4xl">
                  Moves Played
                </h1>
              )}
            </div>
            <div className="overflow-y-auto h-[390px]">
              {moves.map((move, i) => {
                return (
                  <p
                    key={i}
                    className="text-center text-white text-2xl border border-white my-2 mx-6 font-semibold font-sans"
                  >
                    {i % 2 === 0 ? "white" : "black"}: {move.from} &rarr;{" "}
                    {move.to}
                  </p>
                );
              })}
            </div>
          </div>
        )}
        <div className="flex flex-col items-center justify-center">
          {result && (
            <h1 className="text-center text-white text-4xl">
              {result.winner === color ? "You Won" : "You Lose"}
            </h1>
          )}
          {!isGameOn && (
            <>
              <button
                className="text-white border border-white py-5 px-14 hover:bg-white hover:text-black transition-all"
                onClick={startGame}
              >
                Play
              </button>
              <button
                className="text-white border border-white py-5 px-14 hover:bg-white hover:text-black transition-all"
                onClick={logout}
              >
                Logout
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
