export type TGameStatus = "IN_PROGRESS" | "COMPLETED" | "NOT_YET_STARTED";

export type TMove = {
  from: string;
  to: string;
  promotion?: string
};

export type TGameResult = "RESIGN" | "ACCEPT_DRAW" | "CHECKMATE" | "TIMER_EXPIRED";
