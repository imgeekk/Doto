import { Task } from "@/config/model";
import { create } from "zustand";

type TaskWithColumn = {
  taskFromServer: Task;
  localColumnTitle: string;
};

type TaskModalStore = {
  taskData?: TaskWithColumn;
  isOpen: boolean;
  onOpen: ({task, localColumnTitle}: {task: Task, localColumnTitle: string}) => void;
  onClose: () => void;
};

const useTaskModal = create<TaskModalStore>((set) => ({
  taskData: undefined,
  isOpen: false,
  onOpen: ({task, localColumnTitle}: {task: Task, localColumnTitle: string}) => set({ isOpen: true, taskData: { taskFromServer: task, localColumnTitle: localColumnTitle } }),
  onClose: () => set({ isOpen: false, taskData: undefined }),
}));

export default useTaskModal;
