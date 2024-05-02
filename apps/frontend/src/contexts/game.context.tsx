import { create } from "zustand";
import { TColor, TGameResult, TMove } from "../types/game";
import { useShallow } from "zustand/react/shallow";
import { pick } from "lodash";

type TGame = {
  board: string;
  moves: TMove[];
  isGameStarted: boolean;
  color: TColor;
  result: TGameResult;
  socket: WebSocket | null;
};

type TAction = {
  setBoard: (board: string) => void;
  setIsGameStarted: (status: boolean) => void;
  setMoves: (moves: TMove[]) => void;
  setColor: (color: TColor) => void;
  setResult: (result: TGameResult) => void;
  setSocket: (socket: WebSocket | null) => void;
};

type TGameState = TAction & TGame;

const INITIAL_STATE = {
  board: "",
  moves: [],
  isGameStarted: false,
  color: null,
  result: null,
  socket: null
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
  setMoves: (moves: TMove[]) => {
    set({ moves });
  },
  setColor: (color: TColor) => {
    set({ color });
  },
  setResult: (result: TGameResult) => {
    set({ result });
  },
  setSocket: (socket: WebSocket | null) => {
    set({socket});
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
