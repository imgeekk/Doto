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
import { cover } from "three/src/extras/TextureUtils.js";
import { Calendar } from "@/components/ui/calendar";
import { ColumnWithTasks } from "@/config/model";

const MotionButton = motion.create(Button);

const TaskModal = () => {
  const taskId = useTaskModal((state) => state.taskId);
  const isOpen = useTaskModal((state) => state.isOpen);
  const onClose = useTaskModal((state) => state.onClose);

  const queryClient = useQueryClient();
  const params = useParams<{ projectId: string }>();

  const { updateTask, setTaskComplete, deleteTask } = useProject(
    params.projectId,
  );

  const { data: task, isLoading } = useQuery({
    queryKey: ["task", taskId],
    queryFn: () => getTask(taskId!),
    enabled: !!taskId,
    refetchOnWindowFocus: false,
  });

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [isEditingDesc, setIsEditingDesc] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [date, setDate] = useState<Date | undefined>(
    task?.dueDate ? new Date(task.dueDate) : undefined,
  );

  const coverColors = [
    "#803FA5",
    "#216E4E",
    "#7F5F01",
    "#AE2E24",
    "#9E4C00",
    "#1558BC",
    "#943D73",
    "#63666B",
  ];

  useEffect(() => {
    setDeleteConfirm(false);
  }, [taskId]);

  useEffect(() => {
    setDate(task?.dueDate ? new Date(task.dueDate) : undefined);
  }, [task?.dueDate]);

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
        className="p-0 w-[95vw] max-w-[425px] max-h-[85vh] mx-auto font-[inter] top-[10vh] !translate-y-0 flex flex-col overflow-hidden border-0"
      >
        <DialogHeader
          style={{ backgroundColor: task.coverColor ? task.coverColor : "" }}
          className="pl-6 pr-3 h-15 flex flex-row items-center justify-between border-b-1"
        >
          <button className="text-black/90 font-[inter-bold] dark:text-white/80 bg-zinc-300 hover:bg-zinc-200 dark:bg-zinc-700 dark:hover:bg-zinc-600 transition-colors duration-200 hover:cursor-pointer w-fit p-1 px-2 rounded-[4px] text-sm">
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
              className="rounded-[4px]"
              onClick={() => setDeleteConfirm(!deleteConfirm)}
            >
              <MdDelete className="dark:text-white text-black !h-5 !w-5" />
            </Button>
            <DialogClose asChild>
              <Button variant="ghost" size="icon" className="rounded-[4px]">
                <X className="!h-5 !w-5 dark:text-white text-black" />
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
                    className={`w-4 h-4 mx-2 rounded-xs border-1 border-black/90 dark:border-white/40 flex items-center justify-center cursor-pointer ${task?.completed ? "bg-blue-500 border-none" : "bg-transparent"} transition-colors duration-200`}
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
                <button className="border-1 border-black/10 dark:border-white/10 rounded-[4px] cursor-pointer hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors duration-200 flex items-center justify-center p-1.5 px-2 gap-1 text-sm">
                  <IoMdTime size={18} />
                  Due Date
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-85 font-[inter] shadow-2xl shadow-black/50">
                <header className="font-[inter-med] text-center mb-3">
                  Due date
                </header>
                <hr></hr>
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={(newDate) => {
                    setDate(newDate);
                    updateTask({
                      taskId: taskId!,
                      data: { dueDate: newDate },
                    });
                  }}
                  className="my-3 rounded-md border"
                />
                <Button
                  variant="ghost"
                  onClick={() => {
                    updateTask({
                      taskId: taskId!,
                      data: { dueDate: null },
                    });
                  }}
                  className="w-full rounded-[4px] hover:bg-black/15 dark:hover:bg-white/10 flex items-center justify-center gap-1 text-sm"
                >
                  <X className="dark:text-white text-black" />
                  Remove Due Date
                </Button>
              </PopoverContent>
            </Popover>
            <Popover>
              <PopoverTrigger asChild>
                <button className="border-1 border-black/10 dark:border-white/10 rounded-[4px] cursor-pointer hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors duration-200 flex items-center justify-center p-1.5 px-2 gap-1 text-sm">
                  <PiSquareHalfBottomFill size={18} />
                  Change Cover
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-80 font-[inter] shadow-2xl shadow-black/50">
                <header className="font-[inter-med] text-center mb-3">
                  Change cover
                </header>
                <hr></hr>
                <section className="my-3 flex items-center justify-between flex-wrap gap-3">
                  {coverColors.map((color, index) => (
                    <div
                      key={index}
                      style={{ backgroundColor: color }}
                      onClick={() => {
                        updateTask({
                          taskId: taskId!,
                          data: { coverColor: color },
                        });
                      }}
                      className="w-14 h-8 rounded-[4px] hover:cursor-pointer hover:opacity-80 transition-opacity duration-100"
                    >
                      {task.coverColor === color && (
                        <div className="h-full w-full flex items-center justify-center">
                          <Check size={20} className="text-white" />
                        </div>
                      )}
                    </div>
                  ))}
                </section>
                <Button
                  variant="ghost"
                  onClick={() => {
                    updateTask({
                      taskId: taskId!,
                      data: { coverColor: null },
                    });
                  }}
                  className="w-full rounded-[4px] hover:bg-black/15 dark:hover:bg-white/10 flex items-center justify-center gap-1 text-sm"
                >
                  <X className="dark:text-white text-black" />
                  Remove cover
                </Button>
              </PopoverContent>
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
