import { create } from "zustand";
import { TColor, TGameResult, TMove } from "../types/game";
import { useShallow } from "zustand/react/shallow";
import { pick } from "lodash";
import { INITIAL_TIME } from "../constants";

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
  sendingMove: boolean;
  player1TimeLeft: number;
  player2TimeLeft: number;
  gameId: string | null;
};

type Move = TMove & {
  san: string;
};

type Player = {
  name: string;
};

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
  setSendingMove: (sendingMove: boolean) => void;
  startPlayerTimer: (player: 1 | 2, initialTime?: number) => void;
  stopPlayerTimer: (player: 1 | 2) => void;
  resetPlayerTimer: (player: 1 | 2, newTime: number) => void;
  setPlayer1TimeLeft: (player1TimeLeft: number) => void;
  setPlayer2TimeLeft: (player2TimeLeft: number) => void;
  setGameId: (gameId: string | null) => void;
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
  player: null,
  sendingMove: false,
  player1TimeLeft: INITIAL_TIME,
  player2TimeLeft: INITIAL_TIME,
  gameId: null,
};

// Create your store, which includes both state and (optionally) actions
export const useStore = create<TGameState>((set) => {
  let intervalRef1: NodeJS.Timeout | null = null;
  let intervalRef2: NodeJS.Timeout | null = null;

  const startTimer = (player: 1 | 2, initialTime?: number) => {
    set((state) => ({
      ...(player === 1
        ? { player1TimeLeft: initialTime ?? state.player1TimeLeft }
        : {}),
      ...(player === 2
        ? { player2TimeLeft: initialTime ?? state.player2TimeLeft }
        : {}),
    }));

    if (player === 1) {
      intervalRef1 = setInterval(() => {
        set((state) => {
          return { player1TimeLeft: state.player1TimeLeft - 1 };
        });
      }, 1000);
    } else {
      intervalRef2 = setInterval(() => {
        set((state) => {
          return { player2TimeLeft: state.player2TimeLeft - 1 };
        });
      }, 1000);
    }
  };

  const stopTimer = (player: 1 | 2) => {
    if (player === 1) {
      if (!intervalRef1) return;
      clearInterval(intervalRef1);
      intervalRef1 = null;
    } else {
      if (!intervalRef2) return;
      clearInterval(intervalRef2);
      intervalRef2 = null;
    }
  };

  return {
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
      set({ player });
    },
    setSendingMove: (sendingMove: boolean) => {
      set({ sendingMove });
    },
    setPlayer1TimeLeft: (player1TimeLeft: number) => {
      set({ player1TimeLeft });
    },
    setPlayer2TimeLeft: (player2TimeLeft: number) => {
      set({ player2TimeLeft });
    },
    setGameId: (gameId: string | null) => {
      set({ gameId });
    },
    startPlayerTimer: (player, initialTime) => startTimer(player, initialTime),
    stopPlayerTimer: (player) => stopTimer(player),
    resetPlayerTimer: (player, newTime) => {
      stopTimer(player);
      set(() =>
        player === 1
          ? { player1TimeLeft: newTime }
          : { player2TimeLeft: newTime }
      );
    },
  };
});

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
