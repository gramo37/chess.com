export type TEndGamePayload = {
  status: "RESIGN" | "ACCEPT_DRAW" | "TIMER_EXPIRED";
};

export type TInitGamepayload = {
  gameId: string;
}