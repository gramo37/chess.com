import { Chessboard } from "react-chessboard";
import { useInitSocket } from "../hooks/useSocket";
import { Chess, Square } from "chess.js";
import { Piece } from "react-chessboard/dist/chessboard/types";
import { TMove } from "../types/game";
import Moves from "../components/game/Moves";
import { useGameStore } from "../contexts/game.context";
import NewGame from "../components/game/NewGame";
import {
  ACCEPT_DRAW,
  DRAW,
  ENDGAME,
  GAMEOVER,
  GAMERESTARTED,
  GAMESTARTED,
  INVALID_MOVE,
  MOVE,
  MOVESUCCESS,
  OFFER_DRAW,
  REJECT_DRAW,
  RESIGN,
} from "../constants";
import { useEffect, useState } from "react";
import { formatTime, isPromotion } from "../utils/game";
import useTimer from "../hooks/useTimer";

export default function Game() {
  const {
    board,
    isGameStarted,
    color,
    result,
    setBoard,
    setMoves,
    setSans,
    setColor,
    setResult,
    setIsGameStarted,
    socket,
    opponent,
    setOpponent,
  } = useGameStore([
    "board",
    "setBoard",
    "isGameStarted",
    "setIsGameStarted",
    "setMoves",
    "setSans",
    "color",
    "setColor",
    "result",
    "setResult",
    "socket",
    "opponent",
    "setOpponent",
  ]);
  useInitSocket();
  // const queryClient = useQueryClient();

  const [loading, setLoading] = useState(false);
  const {
    timeLeft: player1timeLeft,
    start: startPlayer1Timer,
    stop: stopPlayer1Timer,
  } = useTimer();
  const {
    timeLeft: player2timeLeft,
    start: startPlayer2Timer,
    stop: stopPlayer2Timer,
  } = useTimer();

  const acceptDraw = () => {
    socket?.send(
      JSON.stringify({
        type: ENDGAME,
        payload: {
          status: ACCEPT_DRAW,
        },
      })
    );
  };

  const rejectDraw = () => {
    socket?.send(
      JSON.stringify({
        type: REJECT_DRAW,
      })
    );
  };

  useEffect(() => {
    if (!socket) return;
    socket.onmessage = (event) => {
      const message = JSON.parse(event.data);
      if (message.type === MOVESUCCESS) {
        setBoard(message.payload.board);
        setMoves(message.payload.moves);
        setSans(message.payload.sans);
        setLoading(false);
        const chess = new Chess(message.payload.board);
        if (chess.turn() === "w") {
          startPlayer1Timer(message.payload.player1TimeLeft);
          stopPlayer2Timer();
        } else {
          startPlayer2Timer(message.payload.player2TimeLeft);
          stopPlayer1Timer();
        }
      } else if (message.type === GAMESTARTED) {
        setColor(message.payload.color);
        setBoard("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1");
        setOpponent(message.payload.opponent);
        startPlayer1Timer(message.payload.player1TimeLeft);
      } else if (message.type === GAMEOVER) {
        setMoves([]);
        setResult({
          winner: message.payload.winner?.color,
          loser: message.payload.loser?.color,
          gameResult: message.payload?.result,
        });
        setIsGameStarted(false);
        setLoading(false);
        stopPlayer1Timer();
        stopPlayer2Timer();
        // queryClient.invalidateQueries({ queryKey: ["myGames"] });
      } else if (message.type === GAMERESTARTED) {
        setBoard(message.payload.board);
        setMoves(message.payload.moves);
        setSans(message.payload.sans);
        setColor(message.payload.color);
        setOpponent(message.payload.opponent);
        const chess = new Chess(message.payload.board);
        if (chess.turn() === "w") {
          startPlayer1Timer(message.payload.player1TimeLeft);
        } else {
          startPlayer2Timer(message.payload.player2TimeLeft);
        }
      } else if (message.type === OFFER_DRAW) {
        if (confirm("Opponents was a draw. Do you want to draw ?")) {
          acceptDraw();
        } else {
          rejectDraw();
        }
      } else if (message.type === REJECT_DRAW) {
        alert("Opponent rejected the offer of draw");
      } else if (message.type === INVALID_MOVE) {
        setLoading(false);
      }
    };
    return () => {
      socket.onmessage = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setBoard, setColor, setIsGameStarted, setMoves, setResult, socket]);

  useEffect(() => {
    if (result?.gameResult === RESIGN && result.winner === color) {
      alert("Congrats. You Won. Opponent has resigned");
    } else if (["DRAW", "ACCEPT_DRAW"].includes(result?.gameResult ?? "")) {
      alert("Game is Drawn!");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isGameStarted, result]);

  const makeAMove = (move: TMove) => {
    if (isGameStarted) setLoading(true);
    socket?.send(
      JSON.stringify({
        type: MOVE,
        move,
      })
    );
  };

  function onDrop(sourceSquare: Square, targetSquare: Square, piece: Piece) {
    if (isPromotion(targetSquare, piece)) {
      const promotion = piece[1].toLowerCase();
      makeAMove({
        from: sourceSquare,
        to: targetSquare,
        promotion,
      });
      return true;
    }
    makeAMove({
      from: sourceSquare,
      to: targetSquare,
    });
    return true;
  }

  return (
    <div className="flex border justify-between min-w-96 lg:flex-row flex-col">
      <p className="text-white">Opponent Name: {opponent?.name ?? ""}</p>
      <div className="flex-1 flex max-w-2xl justify-center items-center p-3">
        {loading && (
          <div
            id="overlay"
            className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center"
          >
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-gray-900"></div>
          </div>
        )}
        <div className="text-white">
          <p>White Time: {formatTime(player1timeLeft)}</p>
          <p>Black Time: {formatTime(player2timeLeft)}</p>
        </div>
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
          {[DRAW, ACCEPT_DRAW].includes(result?.gameResult ?? "") ? (
            <h1 className="text-center text-white text-4xl">Game is Drawn</h1>
          ) : (
            result && (
              <h1 className="text-center text-white text-4xl">
                {result.winner === color ? "You Won" : "You Lose"}
              </h1>
            )
          )}
          {!isGameStarted && <NewGame />}
        </div>
      </div>
    </div>
  );
}
