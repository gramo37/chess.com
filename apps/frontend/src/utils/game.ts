import { Square } from "chess.js";
import { Piece } from "react-chessboard/dist/chessboard/types";

export const isPromotion = (targetSquare: Square, piece: Piece) => {
  if(!["wP", "bP"].includes(piece)) return false;
  const isWhitePawn = piece?.[0] === "w";
  const isBlackPawn = piece?.[0] === "b";

  const whitePromotionRank = "8";
  const blackPromotionRank = "1";
  if (
    (isWhitePawn && targetSquare[1] === whitePromotionRank) ||
    (isBlackPawn && targetSquare[1] === blackPromotionRank)
  ) {
    return true;
  }

  return false;
};

export const formatTime = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds < 10 ? "0" : ""}${remainingSeconds}`;
};
