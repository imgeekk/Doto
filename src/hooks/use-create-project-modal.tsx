import {create} from "zustand";

type CreateProjectModalStore = {
    isOpen: boolean;
    onOpen: () => void;
    onClose: () => void;
}

const useCreateProjectModal = create<CreateProjectModalStore>((set) => ({
    isOpen: false,
    onOpen: () => set({ isOpen: true }),
    onClose: () => set({ isOpen: false }),
}))

export default useCreateProjectModal;