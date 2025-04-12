import { create } from "zustand";

interface ModalStore {
  modals: Record<string, boolean>;
  openModal: (key: string) => void;
  closeModal: (key: string) => void;
}

const useModalStore = create<ModalStore>((set) => ({
  modals: {},
  openModal: (key) =>
    set((state) => ({
      modals: { ...state.modals, [key]: true },
    })),
  closeModal: (key) =>
    set((state) => ({
      modals: { ...state.modals, [key]: false },
    })),
}));

export const useModal = (key: string) => {
  const isOpen = useModalStore((state) => state.modals[key] || false);
  const openModal = useModalStore((state) => state.openModal);
  const closeModal = useModalStore((state) => state.closeModal);

  return {
    isOpen,
    onOpen: () => openModal(key),
    onClose: () => closeModal(key),
  };
};
