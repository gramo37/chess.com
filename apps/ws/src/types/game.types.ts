export type TGameStatus = "IN_PROGRESS" | "COMPLETED" | "NOT_YET_STARTED";

export type TMove = {
  from: string;
  to: string;
};

export type TGameResult = "RESIGN" | "ACCEPT_DRAW" | "CHECKMATE";
