import { Chessboard } from "react-chessboard";
import { useInitSocket } from "../hooks/useSocket";
import { Chess, Square } from "chess.js";
import {
  Piece,
  PromotionPieceOption,
} from "react-chessboard/dist/chessboard/types";
import { TMove } from "../types/game";
import Moves from "../components/game/Moves";
import { useGameStore } from "../contexts/game.context";
import NewGame from "../components/game/NewGame";
import {
  ACCEPT_DRAW,
  DRAW,
  ENDGAME,
  GAMEABORTED,
  GAMEOVER,
  GAMERESTARTED,
  GAMESTARTED,
  GET_TIME,
  INVALID_MOVE,
  MOVE,
  MOVESUCCESS,
  OFFER_DRAW,
  REJECT_DRAW,
  RESIGN,
} from "../constants";
import { useEffect, useRef, useState } from "react";
import { formatTime, isPromotion } from "../utils/game";
import useTimer from "../hooks/useTimer";

interface HighlightedSquares {
  [square: string]: React.CSSProperties;
}

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
    player,
    setPlayer
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
    "player",
    "setPlayer"
  ]);
  useInitSocket();
  // const queryClient = useQueryClient();

  const [loading, setLoading] = useState(false);
  const [showPromotionDialog, setShowPromotionDialog] = useState(false);
  const [highlightedSquares, setHighlightedSquares] =
    useState<HighlightedSquares>({});
  const [selectedSquare, setSelectedSquare] = useState<Square | null>(null);
  const [selectedPiece, setSelectedPiece] = useState<Piece | null>(null);
  const [promotionSquare, setPromotionSquare] = useState<Square | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const {
    timeLeft: player1timeLeft,
    start: startPlayer1Timer,
    stop: stopPlayer1Timer,
    setTimeLeft: setPlayer1TimeLeft
  } = useTimer();
  const {
    timeLeft: player2timeLeft,
    start: startPlayer2Timer,
    stop: stopPlayer2Timer,
    setTimeLeft: setPlayer2TimeLeft
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
        setPlayer(message.payload.player);
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
        setPlayer(message.payload.player);
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
      } else if (message.type === GAMEABORTED) {
        setIsGameStarted(false);
      } else if(message.type === GET_TIME) {
        setPlayer1TimeLeft(message.payload.player1TimeLeft)
        setPlayer2TimeLeft(message.payload.player2TimeLeft)
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

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      if(!socket) return;
      socket.send(JSON.stringify({
        type: GET_TIME
      }))
    }, 10000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [socket]);

  const sendMove = (move: TMove) => {
    try {
      const chess = new Chess(board);
      if (
        (chess.turn() === "w" && color === "black") ||
        (chess.turn() === "b" && color === "white")
      )
        return;
      chess.move(move);
      setBoard(chess.fen());
      if (isGameStarted) setLoading(true);
      socket?.send(
        JSON.stringify({
          type: MOVE,
          move,
        })
      );
    } catch (error) {
      console.log(error);
      return;
    }
  };

  const makeAMove = (sourceSquare: Square, targetSquare: Square) => {
    try {
      if (selectedPiece && isPromotion(targetSquare, selectedPiece)) {
        // Show the Promotion Dialog
        setShowPromotionDialog(true);
        setPromotionSquare(targetSquare);
        return false;
      }
      sendMove({
        from: sourceSquare,
        to: targetSquare,
      });
      setSelectedSquare(null);
      setSelectedPiece(null);
      return true;
    } catch (error) {
      return false;
    }
  };

  function onDrop(sourceSquare: Square, targetSquare: Square) {
    // Note -> This will not run during promotion
    // Promotion is handled differently
    try {
      sendMove({
        from: sourceSquare,
        to: targetSquare,
      });
      return true;
    } catch (error) {
      console.log(error);
      return false;
    }
  }

  const onSquareClick = (square: Square, piece?: Piece) => {
    if (selectedSquare) {
      // Make a move
      makeAMove(selectedSquare, square);
      setHighlightedSquares({});
    } else {
      const game = new Chess(board);
      const moves = game.moves({ square, verbose: true }) as TMove[];
      const newHighlightedSquares: HighlightedSquares = {};

      moves.forEach((move) => {
        newHighlightedSquares[move.to] = {
          backgroundColor: "rgb(161 98 7 / 1)",
        };
      });

      setHighlightedSquares(newHighlightedSquares);
      setSelectedSquare(square);
      if (piece) setSelectedPiece(piece);
    }
  };

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
          <Chessboard
            position={board}
            showPromotionDialog={showPromotionDialog}
            promotionDialogVariant="modal"
            onDragOverSquare={(square) => {
              // Update the promotionSquare here
              if (selectedPiece && isPromotion(square, selectedPiece)) {
                setPromotionSquare(square);
              }
            }}
            onPieceDragBegin={(piece, sourceSquare) => {
              setSelectedPiece(piece);
              setSelectedSquare(sourceSquare);
            }}
            onPromotionPieceSelect={(piece?: PromotionPieceOption) => {
              if (!piece || !selectedSquare || !promotionSquare) {
                setShowPromotionDialog(false);
                return false;
              }
              try {
                const promotion = piece?.[1].toLowerCase();
                socket?.send(
                  JSON.stringify({
                    type: MOVE,
                    move: {
                      from: selectedSquare,
                      to: promotionSquare,
                      promotion,
                    },
                  })
                );
                setPromotionSquare(null);
                return true;
              } catch (error) {
                console.log(error);
                return false;
              } finally {
                setShowPromotionDialog(false);
                setSelectedSquare(null);
                setSelectedPiece(null);
              }
            }}
            // boardWidth={500}
            onPieceDrop={onDrop}
            boardOrientation={color ?? "white"}
            onSquareClick={onSquareClick}
            customSquareStyles={highlightedSquares}
          />
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
