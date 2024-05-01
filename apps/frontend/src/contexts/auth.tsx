import { create } from "zustand";

type TUser = {
  id: string;
  token: string;
};

type State = {
  user: TUser | null;
};

type Action = {
  updateUser: (user: State["user"]) => void;
};

// Create your store, which includes both state and (optionally) actions
export const usePersonStore = create<State & Action>((set) => ({
  user: null,
  updateUser: (user) => set(() => ({ user })),
}));
