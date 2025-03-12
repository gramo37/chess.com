import { create } from "zustand";
import { useShallow } from "zustand/react/shallow";
import { pick } from "lodash";

type TUser = {
  id: string;
  token: string;
};

type TState = {
  user: TUser | null;
};

type TAction = {
  updateUser: (user: TState["user"]) => void;
};

type TAuthState = TState & TAction;

// Create your store, which includes both state and (optionally) actions
export const useStore = create<TAuthState>((set) => ({
  user: null,
  updateUser: (user) => set(() => ({ user })),
}));

export const usePersonStore = (value?: Array<keyof TAuthState>) => {
  return useStore(
    useShallow((state) => {
      if (Array.isArray(value)) {
        return pick(state, value);
      }

      return state;
    })
  );
};
