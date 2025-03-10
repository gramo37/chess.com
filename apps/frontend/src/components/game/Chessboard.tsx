import { Chess, Square } from "chess.js";
import {
  Piece,
  PromotionPieceOption,
} from "react-chessboard/dist/chessboard/types";
import { useState } from "react";
import { Chessboard as ReactChessBoard } from "react-chessboard";
import { isPromotion } from "../../utils/game";
import { TMove } from "../../types/game";
import { useGameStore } from "../../contexts/game.context";
import { MOVE } from "../../constants";

interface HighlightedSquares {
  [square: string]: React.CSSProperties;
}

const Chessboard = ({
  setLoading,
}: {
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
  const [showPromotionDialog, setShowPromotionDialog] = useState(false);
  const [highlightedSquares, setHighlightedSquares] =
    useState<HighlightedSquares>({});
  const [selectedSquare, setSelectedSquare] = useState<Square | null>(null);
  const [selectedPiece, setSelectedPiece] = useState<Piece | null>(null);
  const [promotionSquare, setPromotionSquare] = useState<Square | null>(null);

  const { board, isGameStarted, color, setBoard, socket } = useGameStore([
    "board",
    "isGameStarted",
    "color",
    "setBoard",
    "socket",
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
  );
};

export default Chessboard;
