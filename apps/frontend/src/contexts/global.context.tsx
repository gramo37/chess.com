import { create } from "zustand";
import { useShallow } from "zustand/react/shallow";
import { pick } from "lodash";

export type TGlobalModalButtons = Array<{
    text: string;
    onClick: () => void;
}>

type TState = {
    globalModalRef: HTMLDialogElement | null;
    globalModalState: {
        title: string;
        description: string;
        buttons?: TGlobalModalButtons
    }
};

type TAction = {
    setGlobalModalRef: (globalModalRef: HTMLDialogElement) => void;
    openModal: ({ title, description, buttons }: {
        title: string, description: string, buttons?: TGlobalModalButtons
    }) => void;
    closeModal: () => void;
};

type TGlobalState = TState & TAction;

const INITIAL_STATE = {
    globalModalRef: null,
    globalModalState: {
        title: "",
        description: ""
    }
}

const useStore = create<TGlobalState>((set, get) => {
    return {
        ...INITIAL_STATE,
        setGlobalModalRef: (globalModalRef: HTMLDialogElement | null) => {
            set({ globalModalRef })
        },
        openModal: ({ title, description, buttons }: {
            title: string;
            description: string;
            buttons?: TGlobalModalButtons
        }) => {
            const modal = get().globalModalRef;
            if (modal) modal.showModal();
            set({
                globalModalState: {
                    title,
                    description,
                    buttons
                }
            })
        },
        closeModal: () => {
            const modal = get().globalModalRef;
            if (modal) modal.close()
        }
    }
})

export const useGlobalStore = (value?: Array<keyof TGlobalState>) => {
    return useStore(
        useShallow((state) => {
            if (Array.isArray(value)) {
                return pick(state, value);
            }

            return state;
        })
    );
};
