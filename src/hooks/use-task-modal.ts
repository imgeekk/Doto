import { Task } from "@/config/model";
import { create } from "zustand";

type TaskModalStore = {
  taskId?: string;
  isOpen: boolean;
  onOpen: (id: string) => void;
  onClose: () => void;
};

const useTaskModal = create<TaskModalStore>((set) => ({
  taskData: undefined,
  isOpen: false,
  onOpen: (id: string) => set({ isOpen: true, taskId: id}),
  onClose: () => set({ isOpen: false, taskId: undefined }),
}));

export default useTaskModal;
