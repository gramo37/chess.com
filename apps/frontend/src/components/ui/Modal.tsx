import { useEffect, useRef } from "react";
import { TGlobalModalButtons } from "../../contexts/global.context";

export function Modal({
    setGlobalModalRef,
    closeModal,
    globalModalState,
}: {
    setGlobalModalRef: (globalModalRef: HTMLDialogElement) => void;
    closeModal: () => void;
    globalModalState: {
        title: string;
        description: string;
        buttons?: TGlobalModalButtons
    },
}) {
    const modalRef = useRef<HTMLDialogElement | null>(null);

    useEffect(() => {
        if (modalRef.current) {
            setGlobalModalRef(modalRef.current);
        }
    }, [setGlobalModalRef]);

    return (
        <dialog
            ref={modalRef}
            className="p-6 bg-white rounded-lg shadow-lg backdrop:bg-black/30"
            onClick={(e) => {
                if (e.target === modalRef.current) {
                    closeModal();
                }
            }}
        >
            <h2 className="text-xl font-bold">{globalModalState.title}</h2>
            <p className="mt-2 text-gray-600">
                {globalModalState.description}
            </p>
            {globalModalState?.buttons
                ?
                <div className="flex justify-end gap-2">
                    {globalModalState?.buttons.map((button) => {
                        return <button
                            className={`mt-4 px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700`}
                            onClick={button.onClick}
                        >
                            {button.text}
                        </button>
                    })}
                </div> :
                <button
                    onClick={closeModal}
                    className="mt-4 px-4 py-2 text-white bg-red-600 rounded-lg hover:bg-red-700"
                >
                    Close
                </button>}
        </dialog>
    )
}