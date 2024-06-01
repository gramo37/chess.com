import { create } from "zustand";
import { TColor, TGameResult, TMove } from "../types/game";
import { useShallow } from "zustand/react/shallow";
import { pick } from "lodash";

type TGame = {
  board: string;
  moves: TMove[];
  sans: string[];
  isGameStarted: boolean;
  color: TColor;
  result: TGameResult;
  socket: WebSocket | null;
  opponent: Player | null;
  player: Player | null;
};

type Move = TMove & {
  san: string;
};

type Player = {
  name: string
}

type TAction = {
  setBoard: (board: string) => void;
  setIsGameStarted: (status: boolean) => void;
  setMoves: (moves: Move[]) => void;
  setSans: (sans: string[]) => void;
  setColor: (color: TColor) => void;
  setResult: (result: TGameResult) => void;
  setSocket: (socket: WebSocket | null) => void;
  setOpponent: (opponent: Player | null) => void;
  setPlayer: (player: Player | null) => void;
};

type TGameState = TAction & TGame;

const INITIAL_STATE = {
  board: "",
  moves: [],
  sans: [],
  isGameStarted: false,
  color: null,
  result: null,
  socket: null,
  opponent: null,
  player: null
};

// Create your store, which includes both state and (optionally) actions
export const useStore = create<TGame & TAction>((set) => ({
  ...INITIAL_STATE,
  setBoard: (board: string) => {
    set({ board });
  },
  setIsGameStarted: (status: boolean) => {
    set({ isGameStarted: status });
  },
  setMoves: (moves: Move[]) => {
    set({ moves });
  },
  setSans: (sans: string[]) => {
    set({ sans });
  },
  setColor: (color: TColor) => {
    set({ color });
  },
  setResult: (result: TGameResult) => {
    set({ result });
  },
  setSocket: (socket: WebSocket | null) => {
    set({ socket });
  },
  setOpponent: (opponent: Player | null) => {
    set({ opponent });
  },
  setPlayer: (player: Player | null) => {
    set({ player })
  }
}));

export const useGameStore = (value?: Array<keyof TGameState>) => {
  return useStore(
    useShallow((state) => {
      if (Array.isArray(value)) {
        return pick(state, value);
      }

      return state;
    })
  );
};
