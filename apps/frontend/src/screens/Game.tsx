import { Chessboard } from "react-chessboard";
import { useInitSocket } from "../hooks/useSocket";
import { Square } from "chess.js";
// import { Piece } from "react-chessboard/dist/chessboard/types";
import { TMove } from "../types/game";
import Moves from "../components/game/Moves";
import { useGameStore } from "../contexts/game.context";
import NewGame from "../components/game/NewGame";
import {
  GAMEOVER,
  GAMERESTARTED,
  GAMESTARTED,
  MOVESUCCESS,
} from "../constants";
import { useEffect } from "react";

export default function Game() {
  const {
    board,
    isGameStarted,
    color,
    result,
    setBoard,
    setMoves,
    setColor,
    setResult,
    setIsGameStarted,
    socket,
  } = useGameStore([
    "board",
    "setBoard",
    "isGameStarted",
    "setIsGameStarted",
    "setMoves",
    "color",
    "setColor",
    "result",
    "setResult",
    "socket",
  ]);
  useInitSocket();

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
          winner: message.payload.winner.color,
          loser: message.payload.loser.color,
        });
        setIsGameStarted(false);
      } else if (message.type === GAMERESTARTED) {
        setBoard(message.payload.board);
        setMoves(message.payload.moves);
        setColor(message.payload.color);
      }
    };
    return () => {
      socket.onmessage = null;
    };
  }, [setBoard, setColor, setIsGameStarted, setMoves, setResult, socket]);

  const makeAMove = (move: TMove) => {
    socket?.send(
      JSON.stringify({
        type: "move",
        move,
      })
    );
  };

  function onDrop(sourceSquare: Square, targetSquare: Square) {
    // piece: Piece) {
    // TODO: Create a onPromotionCheck function and send promotion if true
    makeAMove({
      from: sourceSquare,
      to: targetSquare,
    });
    return true;
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
        {isGameStarted && <Moves />}
        <div className="flex flex-col items-center justify-center">
          {result && (
            <h1 className="text-center text-white text-4xl">
              {result.winner === color ? "You Won" : "You Lose"}
            </h1>
          )}
          {!isGameStarted && <NewGame />}
        </div>
      </div>
    </div>
  );
}
