"use client";

import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import RippleWaveLoader from "@/components/ui/ripple-loader";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { ComponentRef, useEffect, useRef, useState } from "react";
import { MdKeyboardArrowDown } from "react-icons/md";
import { CgDetailsMore } from "react-icons/cg";
import useTaskModal from "@/hooks/use-task-modal";
import { getTask } from "@/app/actions/services";
import { useProject } from "@/lib/hooks/useProjects";
import { Check } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/tooltip";

const TaskModal = () => {
  const taskId = useTaskModal((state) => state.taskId);
  const isOpen = useTaskModal((state) => state.isOpen);
  const onClose = useTaskModal((state) => state.onClose);

  const queryClient = useQueryClient();
  const params = useParams<{ projectId: string }>();

  const { updateTaskTitle, setTaskComplete } = useProject(params.projectId);

  const { data: task, isLoading } = useQuery({
    queryKey: ["task", taskId],
    queryFn: () => getTask(taskId!),
    enabled: !!taskId,
  });

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [isEditingDesc, setIsEditingDesc] = useState(false);

  useEffect(() => {
    if (task) {
      setTitle(task.title);
    }
  }, [task]);

  const titleInputRef = useRef<ComponentRef<"span">>(null);
  const descriptionRef = useRef<ComponentRef<"span">>(null);

  useEffect(() => {
    if (isEditingTitle && titleInputRef.current) {
      titleInputRef.current.focus();
    }
  }, [isEditingTitle]);

  const onSubmit = async (formData: FormData) => {
    const newTitle = formData.get("title") as string;

    if (!newTitle) return;
    if (newTitle === task?.title) return;

    try {
      titleInputRef.current?.blur();
      updateTaskTitle({ newTitle, taskId: taskId! });
    } catch (error) {
      console.log(error);
    }
  };

  if (isLoading || !task) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="w-[95vw] max-w-[425px] mx-auto font-[monument] top-[10vh] !translate-y-0">
          <RippleWaveLoader className="h-5 w-1" />
        </DialogContent>
      </Dialog>
    );
  }

  async function handleSave(newTitle: string) {
    const trimmed = newTitle?.trim();
    if (!trimmed) {
      if (titleInputRef.current) {
        titleInputRef.current.textContent = task!.title;
      }
      return;
    }

    if (trimmed !== task?.title) {
      try {
        titleInputRef.current?.blur();
        updateTaskTitle({ newTitle: trimmed, taskId: taskId! });
      } catch (error) {
        console.error(error);
      }
    } else {
      return;
    }
  }

  function handleCancel() {
    if (titleInputRef.current) {
      titleInputRef.current.textContent = task!.title;
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[95vw] max-w-[425px] max-h-[85vh] mx-auto font-[monument] top-[10vh] !translate-y-0 flex flex-col overflow-hidden">
        <button className="text-black/90 font-semibold dark:text-white/75 bg-black/20 dark:bg-zinc-800 dark:hover:bg-zinc-700 hover:cursor-pointer w-fit p-1 px-1.5 rounded-sm text-sm">
          {task?.column.title}{" "}
          <MdKeyboardArrowDown className="inline-block text-xl" />
        </button>
        <div id="scrollable-content" className="flex-1 overflow-y-auto p-1">
          <header className="relative flex mb-5">
            <div id="checkbox-container" className="py-3.5">
              <Tooltip>
                <TooltipTrigger className="">
                  <div
                    id="checkbox"
                    onClick={(e) => {
                      e.stopPropagation();
                      setTaskComplete({
                        taskId: task.id,
                        completed: !task.completed,
                      });
                    }}
                    className={`w-4 h-4 mx-2 rounded-xs border-1 border-black/30 dark:border-white/40 flex items-center justify-center cursor-pointer ${task?.completed ? "bg-blue-500 border-none" : "bg-transparent"}`}
                  >
                    {task?.completed && (
                      <Check size={15} className="text-white dark:text-black" />
                    )}
                  </div>
                </TooltipTrigger>
                <TooltipContent className="p-1 rounded-[4px]">
                  <div className="text-center bg-zinc-300 text-black text-xs">
                  {task.completed ? "Mark Incomplete": "Mark Complete"}
                  </div>
                </TooltipContent>
              </Tooltip>
            </div>
            <span
              ref={titleInputRef}
              defaultValue={title}
              contentEditable={isEditingTitle}
              suppressContentEditableWarning
              onClick={(e) => {
                if (!isEditingTitle) setIsEditingTitle(true);
              }}
              onBlur={(e) => {
                setIsEditingTitle(false);
                const newTitle = e.currentTarget.textContent || "";
                handleSave(newTitle);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  const newTitle = e.currentTarget.textContent || "";
                  handleSave(newTitle);
                  e.currentTarget.blur();
                }
                if (e.key === "Escape") {
                  handleCancel();
                  setIsEditingTitle(false);
                  e.currentTarget.blur();
                }
              }}
              className={`text-[25px] w-full block break-words whitespace-pre-wrap font-[inter-bold] px-2 py-1 rounded-[4px] focus:outline-1 focus:outline-blue-500 leading-snug cursor-text`}
            >
              {title}
            </span>
          </header>
          <section className="flex">
            <div className="flex py-1 items-start justify-center mx-2 text-white/80">
              <CgDetailsMore size={20} />
            </div>
            <div className="flex-1">
              <p className="px-1.5 text-lg text-white/80">Description</p>
              
            </div>
          </section>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TaskModal;
