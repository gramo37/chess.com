export type TMove = {
  from: string;
  to: string;
  promotion?: string;
};

export type TGameResult = null | {
  winner: string;
  loser: string;
};

export type TColor = null | "white" | "black";
