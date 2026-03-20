"use client";

import Header from "@/components/Header";
import { Card } from "@/components/ui/card";
import { useProject } from "@/lib/hooks/useProjects";
import { Check, MoreHorizontal, Plus, Timer, X } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import React, { useEffect, useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import { BsFilter } from "react-icons/bs";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ColumnWithTasks, Task } from "@/config/model";
import { MdDeleteOutline, MdKeyboardArrowLeft } from "react-icons/md";
import { useQueryClient } from "@tanstack/react-query";
import useTaskModal from "@/hooks/use-task-modal";
import {
  Dropdown,
  DropdownTrigger,
  DropdownContent,
  DropdownItem,
} from "@/components/basic-dropdown";
import { reorderColumns, reorderTasks } from "@/app/actions/services";
import { CgDetailsMore } from "react-icons/cg";

import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  closestCorners,
  rectIntersection,
  MeasuringStrategy,
  closestCenter,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  horizontalListSortingStrategy,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useTheme } from "next-themes";
import { IoMdTime } from "react-icons/io";
import { WaveLoader } from "@/components/wave-loader";

// (((((((((((((((((((((((((((( SortableTask )))))))))))))))))))))))))))))))

const SortableTask = React.memo(function SortableTask({
  task,
  isBeingDragged,
  onSetComplete,
}: {
  task: Task & { isOptimistic?: boolean };
  isBeingDragged: boolean;
  onSetComplete: (args: { taskId: string; completed: boolean }) => void;
}) {
  const { resolvedTheme } = useTheme();
  const taskModal = useTaskModal();
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: task.id,
    data: { type: "task", task },
    animateLayoutChanges: () => false,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition: isDragging ? undefined : transition,
    opacity: isDragging ? 0.3 : 1,
  };

  const [justCompleted, setJustCompleted] = useState(false);

  if (isBeingDragged) {
    return <div ref={setNodeRef} style={style} />;
  }
  if (task.isOptimistic) {
    const MotionCard = motion.create(Card);
    return (
      <div className="group mb-2.5">
        <MotionCard
          initial={{ opacity: 0.4 }}
          animate={{
            opacity: [0.4, 0.7, 0.4],
          }}
          transition={{
            duration: 0.6,
            ease: "easeInOut",
            repeat: Infinity,
          }}
          className="hover:cursor-not-allowed flex flex-col rounded-[4px] mx-1 bg-white shadow-xs border-none dark:border-white/5 shadow-gray-400 dark:shadow-black/80"
        >
          <div className="flex">
            <span
              {...attributes}
              {...listeners}
              className="flex-1 flex items-center min-w-0 max-sm:text-sm leading-snug break-words p-2"
            >
              {task.title}
            </span>
            <div className="flex p-3 items-start justify-center">
              <div className="w-4 h-4 rounded-xs border-1 border-black/30 dark:border-white/30 flex items-center justify-center bg-transparent"></div>
            </div>
          </div>
        </MotionCard>
      </div>
    );
  }

  const getDueDateLabel = (dueDate: any) => {
    const d = new Date(dueDate);
    if (isNaN(d.getTime())) return null;
    const diff = Math.ceil(
      (d.getTime() - new Date().setHours(0, 0, 0, 0)) / (1000 * 60 * 60 * 24),
    );
    if (diff < 0) return `${Math.abs(diff)}d overdue`;
    if (diff === 0) return "Due today";
    if (diff === 1) return "Due tomorrow";
    return `${diff} days left`;
  };

  return (
    <div ref={setNodeRef} style={style} className="mb-2.5">
      <Card
        style={{ backgroundColor: task.coverColor ? task.coverColor : "" }}
        className={`group/card relative flex rounded-[4px] mx-1 dark:bg-[#1F1F1F] bg-white hover:cursor-pointer shadow-xs dark:shadow-none border border-transparent dark:border-white/10 shadow-gray-400`}
      >
        <div className="absolute h-full flex items-start justify-center">
          <div
            id="checkbox-container"
            onClick={(e) => {
              e.stopPropagation();
              if (!task.completed) setJustCompleted(true);
              setTimeout(() => setJustCompleted(false), 600);
              onSetComplete({ taskId: task.id, completed: !task.completed });
            }}
            className="py-3 px-1.5"
          >
            <div id="burst-particle-container" className="relative">
              <AnimatePresence>
                {justCompleted && (
                  <>
                    {[...Array(8)].map((_, i) => (
                      <motion.div
                        key={i}
                        className={`absolute w-1 h-1 rounded-full ${task.coverColor ? "bg-black/50" : "bg-blue-400"}`}
                        style={{ top: "50%", left: "50%" }}
                        initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
                        animate={{
                          x: Math.cos((i * Math.PI * 2) / 8) * 35,
                          y: Math.sin((i * Math.PI * 2) / 8) * 35,
                          opacity: 0,
                          scale: 0.5,
                        }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 1, ease: "easeOut" }}
                      />
                    ))}
                  </>
                )}
              </AnimatePresence>

              <div
                className={`w-4 h-4 rounded-xs border border-black/50 dark:border-white/35 flex items-center justify-center transition-opacity duration-200
            ${task.completed ? `opacity-100 border-none  ${task.coverColor ? "bg-black/50" : "bg-blue-500"} ` : "opacity-0 group-hover/card:opacity-100"}
            ${task.coverColor ? "border-white/70 dark:border-white/70" : ""}
          `}
              >
                {task.completed && (
                  <Check
                    size={13}
                    className={`text-white dark:text-black ${task.coverColor ? "text-white dark:text-white" : ""}`}
                  />
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Text content */}
        <div
          {...attributes}
          {...listeners}
          onClick={() => taskModal.onOpen(task.id)}
          className="flex-1 flex-col min-w-0 wrap-normal p-2"
        >
          <span
            className={`flex-1 flex items-center min-w-0 max-sm:text-sm overflow-x-hidden leading-snug break-words !cursor-pointer transition-all duration-200
        ${task.coverColor ? "text-white" : ""}
        ${!task.completed ? "group-hover/card:pl-5" : "pl-5"}
      `}
          >
            {task.title}
          </span>
          {(task.description || task.dueDate) && (
            <section className="flex items-center justify-start gap-2.5 flex-wrap mt-2 text-neutral-500 dark:text-neutral-400">
              {task.description && (
                <CgDetailsMore
                  size={16}
                  className={`${task.coverColor ? "text-white/80" : ""}`}
                />
              )}
              {task.dueDate && (
                <span
                  className={`flex items-center justify-center gap-1 text-[13px] ${task.coverColor ? "text-white/80" : ""}`}
                >
                  <IoMdTime size={16} />
                  {getDueDateLabel(task.dueDate)}
                </span>
              )}
            </section>
          )}
        </div>
      </Card>
    </div>
  );
});

// (((((((((((((((((((((((((((((( TaskOverlay )))))))))))))))))))))))))))))))))))))))))

function TaskOverlay({ task }: { task: Task }) {
  return (
    <div className="mb-2.5 rotate-3 opacity-90">
      <Card
        style={{ backgroundColor: task.coverColor ? task.coverColor : "" }}
        className={`group/card relative flex rounded-[4px] mx-1 dark:bg-[#1F1F1F] bg-white hover:cursor-pointer shadow-xs dark:shadow-none border border-transparent dark:border-white/10 shadow-gray-400`}
      >
        <div className="absolute h-full flex items-start justify-center">
          <div id="checkbox-container" className="py-3 px-1.5">
            <div id="burst-particle-container" className="relative">
              <div
                className={`w-4 h-4 rounded-xs border border-black/50 dark:border-white/35 flex items-center justify-center transition-opacity duration-200
            ${task.completed ? `opacity-100 border-none  ${task.coverColor ? "bg-black/50" : "bg-blue-500"} ` : "opacity-0 group-hover/card:opacity-100"}
            ${task.coverColor ? "border-white/70 dark:border-white/70" : ""}
          `}
              >
                {task.completed && (
                  <Check
                    size={13}
                    className={`text-white dark:text-black ${task.coverColor ? "text-white dark:text-white" : ""}`}
                  />
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Text content */}
        <div className="flex-1 flex-col min-w-0 wrap-normal p-2">
          <span
            className={`flex-1 flex items-center min-w-0 max-sm:text-sm overflow-x-hidden leading-snug break-words !cursor-pointer transition-all duration-200
        ${task.coverColor ? "text-white" : ""}
        ${!task.completed ? "group-hover/card:pl-5" : "pl-5"}
      `}
          >
            {task.title}
          </span>
          {(task.description || task.dueDate) && (
            <section className="flex items-center justify-start gap-2.5 flex-wrap mt-2 text-neutral-500 dark:text-neutral-400">
              {task.description && (
                <CgDetailsMore
                  size={16}
                  className={`${task.coverColor ? "text-white/80" : ""}`}
                />
              )}
              {task.dueDate && (
                <span
                  className={`flex items-center justify-center gap-1 text-[13px] ${task.coverColor ? "text-white/80" : ""}`}
                >
                  <IoMdTime size={16} />
                </span>
              )}
            </section>
          )}
        </div>
      </Card>
    </div>
  );
}

// (((((((((((((((((((((((((( DraggableColumn ))))))))))))))))))))))))))))))))

const DraggableColumn = React.memo(function DraggableColumn({
  column,
  placeholder,
  activeTaskId,
  onUpdateColumnTitle,
  onDeleteColumn,
  onCreateTask,
  onSetComplete,
}: {
  column: ColumnWithTasks & { isOptimistic?: boolean };
  placeholder: { colId: string; index: number } | null;
  activeTaskId: string | null;
  onUpdateColumnTitle: (args: { columnId: string; newTitle: string }) => void;
  onDeleteColumn: (columnId: string) => void;
  onCreateTask: (args: {
    title: string;
    columnId: string;
    sortOrder: number;
  }) => void;
  onSetComplete: (args: { taskId: string; completed: boolean }) => void;
}) {
  const [isEditingColumnTitle, setIsEditingColumnTitle] = useState(false);
  const [localColumnTitle, setLocalColumnTitle] = useState(column.title);
  const columnTitleRef = useRef<HTMLSpanElement | null>(null);
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [taskTitle, setTaskTitle] = useState("");

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: column.id,
    data: { type: "column" },
    animateLayoutChanges: () => false,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.3 : 1,
  };

  useEffect(() => {
    if (isEditingColumnTitle && columnTitleRef.current) {
      columnTitleRef.current.focus();
      const range = document.createRange();
      const selection = window.getSelection();
      range.selectNodeContents(columnTitleRef.current);
      range.collapse(false);
      if (selection) {
        selection.removeAllRanges();
        selection.addRange(range);
      }
    }
  }, [isEditingColumnTitle]);

  useEffect(() => {
    setLocalColumnTitle(column.title);
  }, [column]);

  const handleSave = (newTitle: string) => {
    const trimmed = (newTitle || "").trim();
    if (!trimmed) {
      if (columnTitleRef.current)
        columnTitleRef.current.textContent = localColumnTitle;
      setIsEditingColumnTitle(false);
      return;
    }
    if (trimmed !== column.title) {
      onUpdateColumnTitle({ columnId: column.id, newTitle: trimmed });
    }
    setIsEditingColumnTitle(false);
  };

  const handleCreateTask = () => {
    if (!taskTitle.trim()) return;
    onCreateTask({
      title: taskTitle,
      columnId: column.id,
      sortOrder: column.tasks.length,
    });
    setTaskTitle("");
    setIsAddingTask(false);
  };

  if (column.isOptimistic) {
    const MotionCard = motion.create(Card);
    return (
      <div className="mx-2 sm:flex-shrink-0 w-75">
        <MotionCard
          initial={{ opacity: 0.4 }}
          animate={{
            opacity: [0.4, 0.7, 0.4],
          }}
          transition={{
            duration: 0.6,
            ease: "easeInOut",
            repeat: Infinity,
          }}
          className="hover:cursor-not-allowed h-fit p-2 rounded-[6px] bg-[#F7F5F6] dark:bg-[#161616] shadow-none dark:shadow-xs border-1 border-black/10 dark:border-white/5 shadow-gray-400 dark:shadow-black/80"
        >
          {/* Column header — drag handle */}
          <div className="flex items-center justify-between mb-2 pointer-events-none">
            <div className="p-1">
              <span className="text-lg w-full block font-[inter-med] px-2 py-1 rounded-[4px] focus:outline-1 focus:outline-blue-500 hover:bg-black/10 dark:hover:bg-white/10 focus:bg-transparent dark:focus:bg-transparent hover:cursor-pointer focus:cursor-text leading-snug break-words">
                {localColumnTitle}
              </span>
            </div>
            <div onPointerDown={(e) => e.stopPropagation()}>
              <Button variant="ghost">
                <MoreHorizontal size={15} />
              </Button>
            </div>
          </div>
          <hr className="mb-3"></hr>

          <div className="p-1 pointer-events-none">
            <Button
              variant="ghost"
              className="w-full flex items-center justify-center gap-1 rounded-[4px] max-sm:text-[13px]"
            >
              <Plus size={15} />
              Add Task
            </Button>
          </div>
        </MotionCard>
      </div>
    );
  }
  const taskIds = column.tasks.map((t) => t.id);

  return (
    <div
      {...attributes}
      {...listeners}
      ref={setNodeRef}
      style={style}
      className="mx-2 sm:flex-shrink-0 w-75"
    >
      <Card className="h-fit p-2 rounded-[6px] bg-[#F7F5F6] dark:bg-[#161616] shadow-none dark:shadow-xs border-1 border-black/10 dark:border-white/5 shadow-gray-400 dark:shadow-black/80">
        {/* Column header — drag handle */}
        <div className="flex items-center justify-between mb-2 cursor-pointer">
          <div className="p-1">
            <span
              ref={columnTitleRef}
              contentEditable={isEditingColumnTitle}
              suppressContentEditableWarning
              onPointerDown={(e) => {
                if (!isEditingColumnTitle) e.stopPropagation();
              }}
              onClick={(e) => {
                e.stopPropagation();
                if (!isEditingColumnTitle) setIsEditingColumnTitle(true);
              }}
              onBlur={(e) => {
                setIsEditingColumnTitle(false);
                handleSave(e.currentTarget.textContent || "");
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  e.currentTarget.blur();
                }
                if (e.key === "Escape") {
                  e.currentTarget.textContent = column.title;
                  setIsEditingColumnTitle(false);
                }
              }}
              className="text-lg w-full block font-[inter-med] px-2 py-1 rounded-[4px] focus:outline-1 focus:outline-blue-500 hover:bg-black/10 dark:hover:bg-white/10 focus:bg-transparent dark:focus:bg-transparent hover:cursor-pointer focus:cursor-text leading-snug break-words"
            >
              {localColumnTitle}
            </span>
          </div>
          <div onPointerDown={(e) => e.stopPropagation()}>
            <Dropdown>
              <DropdownTrigger className="cursor-pointer">
                <Button variant="ghost">
                  <MoreHorizontal size={15} />
                </Button>
              </DropdownTrigger>
              <DropdownContent align="end" className="w-26">
                <DropdownItem
                  className="gap-2"
                  destructive
                  onClick={() => onDeleteColumn(column.id)}
                >
                  <MdDeleteOutline className="h-5 w-5" />
                  <p>Delete</p>
                </DropdownItem>
              </DropdownContent>
            </Dropdown>
          </div>
        </div>
        <hr className="mb-3"></hr>

        {/* Tasks */}
        <SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
          <ol className="py-[1px]">
            {column.tasks.map((task, index) => (
              <React.Fragment key={task.id}>
                {placeholder?.colId === column.id &&
                  placeholder.index === index && (
                    <div className="mb-2.5 mx-1 h-10 rounded-[4px] bg-black/10 dark:bg-white/10 border-2 border-dashed border-black/20 dark:border-white/20" />
                  )}
                <SortableTask
                  task={task}
                  onSetComplete={onSetComplete}
                  isBeingDragged={task.id === activeTaskId}
                />
              </React.Fragment>
            ))}
            {placeholder?.colId === column.id &&
              placeholder.index === column.tasks.length && (
                <div className="mb-2.5 mx-1 h-10 rounded-[4px] bg-black/10 dark:bg-white/10 border-2 border-dashed border-black/20 dark:border-white/20" />
              )}
          </ol>
        </SortableContext>

        {/* Add task */}
        {!isAddingTask ? (
          <div className="p-1">
            <Button
              variant="ghost"
              className="w-full flex items-center justify-center gap-1 rounded-[4px] max-sm:text-[13px]"
              onClick={() => setIsAddingTask(true)}
            >
              <Plus size={15} />
              Add Task
            </Button>
          </div>
        ) : (
          <div className="p-1">
            <textarea
              value={taskTitle}
              onChange={(e) => setTaskTitle(e.target.value)}
              className="resize-none w-full px-2 py-2 rounded-[4px] bg-zinc-50 dark:bg-zinc-800 border outline-none font-[inter] max-sm:text-sm"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleCreateTask();
                }
              }}
            />
            <div className="flex space-x-2 items-center">
              <Button
                className="bg-blue-400 rounded-[4px] hover:bg-blue-300 text-zinc-900 max-sm:text-[12px]"
                onClick={handleCreateTask}
              >
                Add Task
              </Button>
              <Button
                variant="ghost"
                className="h-full p-2 rounded-[4px]"
                onClick={() => {
                  setIsAddingTask(false);
                  setTaskTitle("");
                }}
              >
                <X size={15} />
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
});

// (((((((((((((((((((((((((((((( ColumnOverlay ))))))))))))))))))))))))))))))))))))

function ColumnOverlay({ column }: { column: ColumnWithTasks }) {
  return (
    <div className="mx-2 sm:flex-shrink-0 w-75 -rotate-2 opacity-90">
      <Card className="h-fit p-2 rounded-[6px] bg-[#F7F5F6] dark:bg-[#161616] shadow-xl border-1 border-black/10 dark:border-white/5">
        <div className="p-1 mb-2">
          <span className="text-lg font-[inter-med] px-2 py-1">
            {column.title}
          </span>
        </div>
        <ol className="py-[1px]">
          {column.tasks.map((task) => (
            <div key={task.id} className="mb-2.5">
              <Card className="flex rounded-[4px] mx-1 dark:bg-[#1F1F1F] bg-white border-none shadow-xs">
                <span className="flex-1 p-2 text-sm">{task.title}</span>
              </Card>
            </div>
          ))}
        </ol>
      </Card>
    </div>
  );
}

const KanbanBoard = React.memo(function KanbanBoard({
  projectId,
  columns,
  createTask,
  deleteColumn,
  updateColumnTitle,
  setTaskComplete,
}: {
  projectId: string;
  columns: ColumnWithTasks[];
  createTask: any;
  deleteColumn: any;
  updateColumnTitle: any;
  setTaskComplete: any;
}) {
  const [activeColumn, setActiveColumn] = useState<ColumnWithTasks | null>(
    null,
  );
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [placeholder, setPlaceholder] = useState<{
    colId: string;
    index: number;
  } | null>(null);

  const queryClient = useQueryClient();

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
  );

  const onDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const type = active.data.current?.type;
    if (type === "column") {
      setActiveColumn(columns.find((c) => c.id === active.id) ?? null);
    } else if (type === "task") {
      setActiveTask(active.data.current?.task ?? null);
    }
  };

  // Move tasks live while dragging over other tasks/columns
  const onDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;
    if (activeId === overId) return;

    const activeType = active.data.current?.type;
    const overType = over.data.current?.type;

    // Never interfere when dragging a column
    if (activeType === "column") return;
    if (activeType !== "task") return;

    if (overType === "task") {
      const destCol = columns.find((c) => c.tasks.some((t) => t.id === overId));
      if (!destCol) return;
      const destIndex = destCol.tasks.findIndex((t) => t.id === overId);
      setPlaceholder({ colId: destCol.id, index: destIndex });
    } else if (overType === "column") {
      const destCol = columns.find((c) => c.id === overId);
      if (!destCol) return;
      setPlaceholder({ colId: destCol.id, index: destCol.tasks.length });
    }
  };

  const onDragEnd = (event: DragEndEvent) => {
    const currentPlaceholder = placeholder;
    setPlaceholder(null);
    setActiveTask(null);
    setActiveColumn(null);

    const { active, over } = event;
    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;
    const activeType = active.data.current?.type;

    const previousData = queryClient.getQueryData([
      "project",
      projectId,
    ]) as any;
    if (!previousData) return;

    if (activeType === "column" && activeId !== overId) {
      const newData: any = structuredClone(previousData);
      const cols = newData.columnsWithTasks;
      const oldIndex = cols.findIndex((c: any) => c.id === activeId);
      const newIndex = cols.findIndex((c: any) => c.id === overId);
      if (oldIndex === -1 || newIndex === -1) return;

      const reordered = arrayMove(cols, oldIndex, newIndex);
      reordered.forEach((col: any, i: number) => {
        col.sortOrder = i;
      });
      newData.columnsWithTasks = reordered;

      queryClient.setQueryData(["project", projectId], newData);

      reorderColumns(
        projectId,
        reordered.map((col: any, i: number) => ({ id: col.id, sortOrder: i })),
      ).catch(() => {
        queryClient.setQueryData(["project", projectId], previousData);
      });
      return;
    }

    if (activeType === "task" && currentPlaceholder) {
      const newData: any = structuredClone(previousData);
      const cols = newData.columnsWithTasks;
      const sourceColIndex = cols.findIndex((c: any) =>
        c.tasks.some((t: any) => t.id === activeId),
      );
      if (sourceColIndex === -1) return;
      const sourceTaskIndex = cols[sourceColIndex].tasks.findIndex(
        (t: any) => t.id === activeId,
      );

      const destColIndex = cols.findIndex(
        (c: any) => c.id === currentPlaceholder.colId,
      );
      if (destColIndex === -1) return;

      let destTaskIndex = currentPlaceholder.index;
      // if moving within same column and source is before dest, account for removal
      if (sourceColIndex === destColIndex && sourceTaskIndex < destTaskIndex) {
        destTaskIndex--;
      }

      const [movedTask] = cols[sourceColIndex].tasks.splice(sourceTaskIndex, 1);
      cols[destColIndex].tasks.splice(destTaskIndex, 0, {
        ...movedTask,
        columnId: cols[destColIndex].id,
      });

      queryClient.setQueryData(["project", projectId], newData);

      const updates: { id: string; columnId: string; sortOrder: number }[] = [];
      cols.forEach((col: any) => {
        col.tasks.forEach((task: any, i: number) => {
          updates.push({ id: task.id, columnId: col.id, sortOrder: i });
        });
      });
      reorderTasks(updates).catch(() => {
        queryClient.setQueryData(["project", projectId], previousData);
      });
    }
  };
  const columnIds = columns.map((c) => c.id);

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={activeColumn ? rectIntersection : closestCenter}
      measuring={{ droppable: { strategy: MeasuringStrategy.WhileDragging } }}
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDragEnd={onDragEnd}
    >
      <SortableContext
        items={columnIds}
        strategy={horizontalListSortingStrategy}
      >
        <ol className="flex">
          {columns.map((column) => (
            <DraggableColumn
              key={column.id}
              column={column}
              placeholder={placeholder}
              activeTaskId={activeTask?.id || null}
              onUpdateColumnTitle={updateColumnTitle}
              onDeleteColumn={deleteColumn}
              onCreateTask={createTask}
              onSetComplete={setTaskComplete}
            />
          ))}
        </ol>
      </SortableContext>

      <DragOverlay dropAnimation={null}>
        {activeColumn && <ColumnOverlay column={activeColumn} />}
        {activeTask && <TaskOverlay task={activeTask} />}
      </DragOverlay>
    </DndContext>
  );
});

// (((((((((((((((((((((((((((((((( Page ))))))))))))))))))))))))))))))))))))))))))

const Page = () => {
  const router = useRouter();
  const params = useParams<{ projectId: string }>();
  const {
    project,
    columns,
    isLoading,
    error,
    updateProjectTitle,
    createTask,
    createColumn,
    deleteColumn,
    updateColumnTitle,
    setTaskComplete,
  } = useProject(params.projectId);

  const [isEditingProjectTitle, setIsEditingProjectTitle] = useState(false);
  const [localProjectTitle, setLocalProjectTitle] = useState(project?.title);
  const projectTitleRef = useRef<HTMLSpanElement>(null);
  const [filterCount] = useState(0);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isAddingColumn, setIsAddingColumn] = useState(false);

  useEffect(() => {
    if (project?.title) setLocalProjectTitle(project.title);
  }, [project?.title]);

  useEffect(() => {
    if (isEditingProjectTitle && projectTitleRef.current) {
      projectTitleRef.current.focus();
      const range = document.createRange();
      const selection = window.getSelection();
      range.selectNodeContents(projectTitleRef.current);
      range.collapse(false);
      if (selection) {
        selection.removeAllRanges();
        selection.addRange(range);
      }
    }
  }, [isEditingProjectTitle]);

  const handleProjectTitleSubmit = (newTitle: string) => {
    if (!newTitle?.trim() || !project) {
      setLocalProjectTitle(project?.title);
      if (projectTitleRef.current)
        projectTitleRef.current.textContent = localProjectTitle!;
      setIsEditingProjectTitle(false);
      return;
    }
    if (newTitle === project.title) {
      setIsEditingProjectTitle(false);
      return;
    }
    updateProjectTitle({ projectId: project.id, newTitle });
    setIsEditingProjectTitle(false);
  };

  if (isLoading) {
    return (
      <div className="relative h-screen w-full">
        <Header visible={true} className="mb-5" />
        <div className="absolute inset-0 h-screen flex items-center justify-center">
          <WaveLoader />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="relative h-screen w-full">
        <Header visible={true} className="mb-5" />
        <div className="absolute inset-0 h-screen flex items-center justify-center">
          <h1 className="text-sm font-[inter] tracking-tighter text-black/70 dark:text-white/70">
            Yo dawg wsg. Oh about the error.. couldn't fetch it twin :(
          </h1>
        </div>
      </div>
    );
  }

  function handleCreateNewColumn(formData: FormData) {
    const newColumnTitle = formData.get("title") as string;
    try {
      createColumn({
        projectId: project!.id,
        title: newColumnTitle,
        sortOrder: columns.length,
      });
      setIsAddingColumn(false);
    } catch (err) {
      console.error("Error creating column:", err);
    }
  }

  return (
    <div className="h-screen max-w-[100vw] font-[inter] flex flex-col items-center">
      <Header visible={true} className="mb-5" />
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="h-screen w-full flex flex-col"
      >
        {/* NavBar */}
        <nav className="bg-transparent backdrop-blur-2xl flex flex-col px-3">
          <Button
            id="back-button"
            variant="ghost"
            className="w-fit px-1 pr-2"
            onClick={() => router.push("/projects")}
          >
            <MdKeyboardArrowLeft size={15} />
            Back
          </Button>
          <div className="flex items-center justify-between h-15">
            <span
              ref={projectTitleRef}
              contentEditable={isEditingProjectTitle}
              suppressContentEditableWarning
              onClick={() => setIsEditingProjectTitle(true)}
              onBlur={(e) => {
                setIsEditingProjectTitle(false);
                handleProjectTitleSubmit(e.currentTarget.textContent || "");
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  e.currentTarget.blur();
                }
                if (e.key === "Escape") {
                  e.currentTarget.textContent = project?.title || "";
                  setIsEditingProjectTitle(false);
                }
              }}
              className="text-2xl sm:text-3xl font-[inter-bold] p-1 px-2 max-w-[90%] truncate whitespace-nowrap rounded-[4px] focus:outline-1 focus:outline-blue-500 hover:bg-black/10 dark:hover:bg-white/10 focus:bg-transparent dark:focus:bg-transparent hover:cursor-pointer focus:cursor-text"
            >
              {localProjectTitle}
            </span>
            <button
              className="dark:hover:bg-zinc-800 hover:bg-zinc-300 p-1 flex gap-1 items-center text-sm hover:cursor-pointer rounded-sm"
              onClick={() => setIsFilterOpen(true)}
            >
              <BsFilter size={20} />
              {filterCount === 0 && (
                <span className="text-[10px]">{filterCount}</span>
              )}
            </button>
          </div>
        </nav>

        {/* Filter dialog */}
        <Dialog open={isFilterOpen} onOpenChange={setIsFilterOpen}>
          <DialogContent className="w-[95vw] max-w-[425px] mx-auto font-[inter]">
            <DialogHeader>
              <DialogTitle>Filter Tasks</DialogTitle>
              <p className="text-xs sm:text-sm text-zinc-600">
                Filter tasks by priority, due date or assignee
              </p>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2 max-sm:text-sm">
                <label>Priority</label>
                <div className="flex gap-2 mt-1">
                  {["low", "medium", "high"].map((priority, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      size="default"
                      className="hover:cursor-pointer text-xs sm:text-sm"
                    >
                      {priority.charAt(0).toUpperCase() + priority.slice(1)}
                      <div
                        className={`h-2 w-2 rounded-xs ml-2 ${
                          priority === "low"
                            ? "bg-green-600"
                            : priority === "medium"
                              ? "bg-yellow-600"
                              : "bg-red-600"
                        }`}
                      />
                    </Button>
                  ))}
                </div>
              </div>
              <div className="space-y-2 max-sm:text-sm">
                <label>Due Date</label>
                <div className="mt-1">
                  <Input
                    type="date"
                    className="rounded-sm border border-zinc-300 dark:border-zinc-800 px-3 py-2 mb-3 text-foreground shadow-sm shadow-black/5 transition-shadow dark:focus-visible:border-blue-500 focus-visible:border-blue-500 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                  />
                </div>
              </div>
              <div className="flex justify-between pt-3">
                <Button
                  variant="outline"
                  className="hover:cursor-pointer max-sm:text-xs"
                >
                  Clear
                </Button>
                <Button className="hover:cursor-pointer max-sm:text-xs">
                  Apply
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Main section */}
        <main className="flex-1 p-3">
          <section className="h-full flex overflow-x-auto flex-1 overflow-auto custom-scrollbar">
            <KanbanBoard
              projectId={project!.id}
              columns={columns}
              createTask={createTask}
              deleteColumn={deleteColumn}
              updateColumnTitle={updateColumnTitle}
              setTaskComplete={setTaskComplete}
            />

            {isAddingColumn ? (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleCreateNewColumn(new FormData(e.currentTarget));
                }}
              >
                <Card className="w-75 p-2 mx-2 space-y-4 rounded-[6px] bg-[#F7F5F6] dark:bg-[#161616] shadow-xs border-0 dark:border-1 dark:border-white/5 shadow-gray-400 dark:shadow-black/80">
                  <input
                    name="title"
                    placeholder="Enter column title"
                    className="resize-none text-md w-full px-3 py-2 rounded-[4px] bg-zinc-50 dark:bg-zinc-800 border outline-none font-[inter]"
                    autoFocus
                  />
                  <div className="flex space-x-2 items-center">
                    <Button
                      type="submit"
                      className="bg-blue-400 rounded-[4px] hover:bg-blue-300 text-zinc-900"
                    >
                      Add Column
                    </Button>
                    <Button
                      variant="ghost"
                      className="h-full p-2 rounded-[4px]"
                      onClick={() => setIsAddingColumn(false)}
                    >
                      <X size={15} />
                    </Button>
                  </div>
                </Card>
              </form>
            ) : (
              <button
                onClick={() => setIsAddingColumn(true)}
                className="p-3 rounded-[6px] bg-black/20 hover:bg-black/10 dark:bg-white/20 dark:hover:bg-white/10 backdrop-blur-[2px] text-md sm:flex-shrink-0 h-10 min-w-75 flex items-center justify-center hover:cursor-pointer gap-1 mx-2"
              >
                <Plus size={15} />
                Add a column
              </button>
            )}
          </section>
        </main>
      </motion.section>
    </div>
  );
};

export default Page;
