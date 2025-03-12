import { Chess, Square } from "chess.js";
import {
  Piece,
  PromotionPieceOption,
} from "react-chessboard/dist/chessboard/types";
import { useState } from "react";
import { Chessboard as ReactChessBoard } from "react-chessboard";
import { formatTime, isPromotion } from "../../utils/game";
import { TColor, TMove } from "../../types/game";
import { useGameStore } from "../../contexts/game.context";
import { MOVE } from "../../constants";

interface HighlightedSquares {
  [square: string]: React.CSSProperties;
}

const Chessboard = () => {
  const [showPromotionDialog, setShowPromotionDialog] = useState(false);
  const [highlightedSquares, setHighlightedSquares] =
    useState<HighlightedSquares>({});
  const [selectedSquare, setSelectedSquare] = useState<Square | null>(null);
  const [selectedPiece, setSelectedPiece] = useState<Piece | null>(null);
  const [promotionSquare, setPromotionSquare] = useState<Square | null>(null);

  const {
    board,
    isGameStarted,
    color,
    setBoard,
    socket,
    opponent,
    player,
    setSendingMove,
    player1TimeLeft,
    player2TimeLeft
  } = useGameStore([
    "board",
    "isGameStarted",
    "color",
    "setBoard",
    "socket",
    "opponent",
    "player",
    "setSendingMove",
    "player1TimeLeft",
    "player2TimeLeft"
  ]);

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
      if (isGameStarted) setSendingMove(true);
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
    <div className="w-full lg:w-1/2 p-4 lg:p-8 flex flex-col items-center">
      <TimerComponent
        name={opponent?.name ?? ""}
        color={color}
        whiteTimer={formatTime(player2TimeLeft)}
        blackTimer={formatTime(player1TimeLeft)}
      />
      <ReactChessBoard
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
      <TimerComponent
        name={player?.name ?? ""}
        color={color}
        whiteTimer={formatTime(player1TimeLeft)}
        blackTimer={formatTime(player2TimeLeft)}
      />
    </div>
  );
};

function TimerComponent({
  name,
  color,
  whiteTimer,
  blackTimer,
}: {
  name: string;
  color: TColor;
  whiteTimer: string;
  blackTimer: string;
}) {
  return (
    <div className="mt-4 text-center">
      <h2 className="text-xl font-bold text-gray-300">{name}</h2>
      <p className="text-gray-400">
        Time left: {color === "white" ? whiteTimer : blackTimer}
      </p>
    </div>
  );
}

export default Chessboard;
