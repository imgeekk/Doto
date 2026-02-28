"use client";

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogPortal,
  DialogTitle,
} from "@/components/ui/dialog";
import RippleWaveLoader from "@/components/ui/ripple-loader";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { ComponentRef, useEffect, useRef, useState } from "react";
import { MdDelete, MdDeleteOutline, MdKeyboardArrowDown } from "react-icons/md";
import { CgDetailsMore } from "react-icons/cg";
import useTaskModal from "@/hooks/use-task-modal";
import { getTask } from "@/app/actions/services";
import { useProject } from "@/lib/hooks/useProjects";
import { Check, Edit, TimerIcon, X } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/tooltip";
import {
  Popover,
  PopoverAnchor,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button-1";
import { WiTime4 } from "react-icons/wi";
import { IoMdTime } from "react-icons/io";
import { PiSquareHalfBottomFill } from "react-icons/pi";
import { motion } from "framer-motion";

const TaskModal = () => {
  const taskId = useTaskModal((state) => state.taskId);
  const isOpen = useTaskModal((state) => state.isOpen);
  const onClose = useTaskModal((state) => state.onClose);

  const queryClient = useQueryClient();
  const params = useParams<{ projectId: string }>();

  const { updateTask, setTaskComplete, deleteTask } = useProject(params.projectId);

  const { data: task, isLoading } = useQuery({
    queryKey: ["task", taskId],
    queryFn: () => getTask(taskId!),
    enabled: !!taskId,
  });

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [isEditingDesc, setIsEditingDesc] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(false);

  const MotionButton = motion.create(Button);

  useEffect(() => {
    if (task) {
      setTitle(task.title);
    }
  }, [task?.title]);

  useEffect(() => {
    if (task) {
      setDescription(task.description || "");
    }
  }, [task?.description]);

  const titleInputRef = useRef<ComponentRef<"span">>(null);
  const descInputRef = useRef<ComponentRef<"span">>(null);

  useEffect(() => {
    if (isEditingTitle && titleInputRef.current) {
      titleInputRef.current.focus();
    }
  }, [isEditingTitle]);

  useEffect(() => {
    if (isEditingDesc && descInputRef.current) {
      descInputRef.current.focus();
    }
  }, [isEditingDesc]);

  const onSubmit = async (formData: FormData) => {
    const newTitle = formData.get("title") as string;

    if (!newTitle) return;
    if (newTitle === task?.title) return;

    try {
      titleInputRef.current?.blur();
      updateTask({ taskId: taskId!, data: { title: newTitle } });
    } catch (error) {
      console.log(error);
    }
  };

  if (isLoading || !task) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent
          showCloseButton={false}
          className="w-[95vw] max-w-[425px] mx-auto font-[inter] top-[10vh] !translate-y-0 p-0 h-15"
        >
          <RippleWaveLoader className="h-5 w-1" />
        </DialogContent>
      </Dialog>
    );
  }

  async function handleSave(newTitle: string) {
    const trimmed = newTitle?.trim();

    if (!trimmed) {
      setTitle(task!.title);
      if (titleInputRef.current) {
        titleInputRef.current.textContent = title;
      }
      return;
    }

    if (trimmed !== task?.title) {
      try {
        titleInputRef.current?.blur();
        updateTask({ taskId: taskId!, data: { title: trimmed } });
      } catch (error) {
        console.error(error);
      }
    } else {
      return;
    }
  }

  function handleCancel() {
    setTitle(task!.title);
    setIsEditingTitle(false);
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        showCloseButton={false}
        className="p-0 w-[95vw] max-w-[425px] max-h-[85vh] mx-auto font-[inter] top-[10vh] !translate-y-0 flex flex-col overflow-hidden"
      >
        <DialogHeader className="pl-6 pr-3 h-15 flex flex-row items-center justify-between border-b-1">
          <button className="text-black/90 font-[inter-bold] dark:text-white/75 bg-black/20 dark:bg-zinc-800 dark:hover:bg-zinc-700 hover:cursor-pointer w-fit p-1 px-1.5 rounded-sm text-sm">
            {task?.column.title}{" "}
            <MdKeyboardArrowDown className="inline-block text-xl" />
          </button>
          <div className="flex items-center justify-center gap-2">
            {deleteConfirm && (
              <MotionButton
                initial={{ opacity: 0 }}
                animate={{ opacity: 100 }}
                onClick={() => {
                  deleteTask(task.id);
                  setDeleteConfirm(false);
                  onClose();
                }}
                className="p-2 rounded-[4px] bg-red-500 hover:bg-red-400  text-white text-xs"
              >
                Confirm delete
              </MotionButton>
            )}
            <Button
              variant="ghost"
              className="p-2.5"
              onClick={() => setDeleteConfirm(!deleteConfirm)}
            >
              <MdDeleteOutline />
            </Button>
            <DialogClose asChild>
              <Button variant="ghost" size="icon">
                <X className="h-4 w-4" />
              </Button>
            </DialogClose>
          </div>
        </DialogHeader>
        <div
          id="scrollable-content"
          className="flex-1 overflow-y-auto px-3 sm:px-5 py-5"
        >
          <header id="task-title-section" className="relative flex mb-7">
            <div
              id="checkbox-container"
              className="w-10 flex items-start justify-center py-2 sm:py-3"
            >
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
                    className={`w-4 h-4 mx-2 rounded-xs border-1 border-black/90 dark:border-white/40 flex items-center justify-center cursor-pointer ${task?.completed ? "bg-blue-500 border-none" : "bg-transparent"}`}
                  >
                    {task?.completed && (
                      <Check size={15} className="text-white dark:text-black" />
                    )}
                  </div>
                </TooltipTrigger>
                <TooltipContent className="ml-3 p-1 rounded-[4px] max-sm:hidden">
                  <div className="text-center text-[10px]">
                    {task.completed ? "Mark Incomplete" : "Mark Complete"}
                  </div>
                </TooltipContent>
              </Tooltip>
            </div>
            <span
              ref={titleInputRef}
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
                  e.currentTarget.blur();
                }
                if (e.key === "Escape") {
                  handleCancel();
                }
              }}
              className="text-2xl sm:text-3xl font-[inter-bold] h-fit px-2 w-full block break-words whitespace-pre-wrap rounded-[3px] focus:outline-1 focus:outline-blue-500 leading-snug cursor-pointer focus:cursor-text"
            >
              {title}
            </span>
          </header>
          <section className="flex items-center justify-start flex-wrap pl-10 mb-10 gap-3">
            <Popover>
              <PopoverTrigger asChild>
                <button className="border-1 border-black/10 dark:border-white/10 rounded-[4px] cursor-pointer hover:bg-zinc-200 dark:hover:bg-zinc-800 flex items-center justify-center p-1.5 px-2 gap-1 max-sm:text-sm">
                  <IoMdTime size={18} />
                  Due Date
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-80">this</PopoverContent>
            </Popover>
            <Popover>
              <PopoverTrigger asChild>
                <button className="border-1 border-black/10 dark:border-white/10 rounded-[4px] cursor-pointer hover:bg-zinc-200 dark:hover:bg-zinc-800 flex items-center justify-center p-1.5 px-2 gap-1 max-sm:text-sm">
                  <PiSquareHalfBottomFill size={18} />
                  Change Cover
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-80">this</PopoverContent>
            </Popover>
          </section>
          <section className="flex">
            <div className="w-10 flex justify-center dark:text-white/90 text-black/90">
              <CgDetailsMore size={23} />
            </div>
            <div className="flex-1">
              <p className="px-1.5 mb-2 text-[16px] font-[inter-med] text-black/90 dark:text-white/90">
                Description
              </p>
              {!isEditingDesc && !task.description && (
                <div
                  onClick={() => {
                    setIsEditingDesc(true);
                    descInputRef.current?.focus();
                  }}
                  className="px-2 py-1 text-sm cursor-pointer text-black/80 dark:text-white/60 rounded-[3px] "
                >
                  Add a description
                </div>
              )}

              {(isEditingDesc || task.description) && (
                <span
                  ref={descInputRef}
                  contentEditable
                  suppressContentEditableWarning
                  onBlur={(e) => {
                    const newDescription =
                      e.currentTarget.textContent?.trim() || "";
                    setIsEditingDesc(false);
                    if (!newDescription) return;
                    if (newDescription !== task.description) {
                      updateTask({
                        taskId: taskId!,
                        data: { description: newDescription },
                      });
                    } else {
                      return;
                    }
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      setIsEditingDesc(false);
                      e.currentTarget.blur();
                    }
                    if (e.key === "Escape") {
                      setIsEditingDesc(false);
                    }
                  }}
                  className={`text-[14px] text-black/80 dark:text-white/60 w-full block break-words whitespace-pre-wrap font-[inter] px-2 py-1 rounded-[3px] focus:outline-1 focus:outline-blue-500 leading-snug cursor-pointer focus:cursor-text`}
                >
                  {task.description}
                </span>
              )}
            </div>
          </section>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TaskModal;
