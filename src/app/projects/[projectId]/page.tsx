"use client";

import Header from "@/components/Header";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { useProject } from "@/lib/hooks/useProjects";
import { Check, MoreHorizontal, Plus, X } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import RippleWaveLoader from "@/components/ui/ripple-loader";
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
import { DragDropContext, Draggable, Droppable } from "@hello-pangea/dnd";
import {
  reorderColumns,
  reorderTasks,
  setComplete,
} from "@/app/actions/services";
import useCardModal from "@/hooks/use-task-modal";
import { MdKeyboardArrowLeft } from "react-icons/md";
import { useQueryClient } from "@tanstack/react-query";

const Page = () => {
  const router = useRouter();
  const params = useParams<{ projectId: string }>();
  const {
    project,
    columns: serverColumns,
    isLoading,
    error,
    updateProjectTitle,
    createTask,
    createColumn,
    updateColumnTitle,
    setTaskComplete,
    reorderTask,
    reorderColumns,
    moveTask,
    // createNewColumn,
  } = useProject(params.projectId);

  const [isEditingProjectTitle, setIsEditingProjectTitle] = useState(false);
  const [localProjectTitle, setLocalProjectTitle] = useState(project?.title);

  const projectTitleSpanRef = useRef<HTMLSpanElement>(null);
  const projectTitleRef = useRef<HTMLSpanElement>(null);
  const [filterCount, setFilterCount] = useState(0);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [activeTaskId, setActiveTaskId] = useState<number | null>(null);
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [isReorderingColumns, setIsReorderingColumns] = useState(false);
  const [isReorderingTasks, setIsReorderingTasks] = useState(false);
  const [isAddingColumn, setIsAddingColumn] = useState(false);
  const [reorderingColumns, setReorderingColumns] = useState(false);
  const [reorderingTasks, setReorderingTasks] = useState(false);

  const [dragActiveTask, setDragActiveTask] = useState<Task | null>(null);

  const onFilterClick = () => {
    setIsFilterOpen(true);
  };

  useEffect(() => {
    if (project?.title) {
      setLocalProjectTitle(project.title);
    }
  }, [project?.title]);

  useEffect(() => {
    if (isEditingProjectTitle && projectTitleRef.current) {
      projectTitleRef.current.focus();
      // Optional: place cursor at the end of text
      const range = document.createRange();
      const selection = window.getSelection();
      range.selectNodeContents(projectTitleRef.current);
      range.collapse(false); // collapse to end
      if (selection) {
        selection.removeAllRanges();
      }
      if (selection) {
        selection.addRange(range);
      }
    }
  }, [isEditingProjectTitle]);

  const handleProjectTitleSubmit = async (newTitle: string) => {
    if (!newTitle?.trim() || !project) {
      setLocalProjectTitle(project?.title);
      if (projectTitleRef.current) {
        projectTitleRef.current.textContent = localProjectTitle!;
      }
      setIsEditingProjectTitle(false);
      return;
    }

    if (newTitle === project.title) {
      setIsEditingProjectTitle(false);
      return;
    }
    try {
      updateProjectTitle({
        projectId: project.id,
        newTitle: newTitle,
      });
      setIsEditingProjectTitle(false);
    } catch (error) {
      console.log(error);
    }
    setIsEditingProjectTitle(false);
  };

  // async function createTask(taskData: {
  //   title: string;
  //   description?: string;
  //   // assignee?: string;
  //   dueDate?: string;
  //   priority?: "low" | "medium" | "high";
  // }) {}

  // async function handleCreateTask(e: any) {
  //   e.preventDefault();

  //   const formData = new FormData(e.currentTarget);
  //   const taskData = {
  //     title: formData.get("title") as string,
  //     description: (formData.get("description") as string) || undefined,
  //     // assignee: formData.get("assignee") as string || undefined,
  //     dueDate: (formData.get("dueDate") as string) || undefined,
  //     priority:
  //       (formData.get("priority") as "low" | "medium" | "high") || "medium",
  //   };

  //   if (taskData.title?.trim()) {
  //     await createTask(taskData);
  //   }
  // }

  const onDragEnd = async (result: any) => {
    const { source, destination, type } = result;

    // dropped outside the list
    if (!destination) {
      return;
    }

    if (
      source.droppableId === destination.droppableId &&
      source.index === destination.index
    ) {
      return;
    }

    // Handle column reordering
    if (type === "column") {
      const newColumns = Array.from(serverColumns);
      const [movedColumn] = newColumns.splice(source.index, 1);
      newColumns.splice(destination.index, 0, movedColumn);
      setIsReorderingColumns(true);

      //db update preparation
      const reorderedColumns = newColumns.map((col, index) => ({
        id: col.id,
        sortOrder: index,
      }));

      try {
        setReorderingColumns(true);
        reorderColumns({
          projectId: project!.id,
          columnUpdates: reorderedColumns,
        });
        setReorderingColumns(false);
      } catch (err) {
        console.error("Error reordering columns:", err);
      } finally {
        setIsReorderingColumns(false);
      }

      return;
    }

    // Handle task reordering
    if (type === "task") {
      setIsReorderingTasks(true);
      let reorderdTasks = [];

      if (source.droppableId === destination.droppableId) {
        // Reordering within the same column
        const column = serverColumns.find(
          (col) => col.id === source.droppableId,
        );
        if (!column) {
          setReorderingTasks(false);
          return;
        }
        const newTasks = Array.from(column.tasks);
        const [movedTask] = newTasks.splice(source.index, 1);
        newTasks.splice(destination.index, 0, movedTask);
        const newColumns = serverColumns.map((col) =>
          column && col.id === column.id ? { ...col, tasks: newTasks } : col,
        );

        //db update preparation
        reorderdTasks = newTasks.map((task, index) => ({
          id: task.id,
          columnId: column.id,
          sortOrder: index,
        }));
      } else {
        // Moving task between columns
        const sourceColumn = serverColumns.find(
          (col) => col.id === source.droppableId,
        );
        const destColumn = serverColumns.find(
          (col) => col.id === destination.droppableId,
        );
        if (!sourceColumn || !destColumn) return;
        const sourceTasks = Array.from(sourceColumn.tasks);
        const destTasks = Array.from(destColumn.tasks);
        const [movedTask] = sourceTasks.splice(source.index, 1);
        destTasks.splice(destination.index, 0, movedTask);
        const newColumns = serverColumns.map((col) => {
          if (col.id === sourceColumn.id) {
            return { ...col, tasks: sourceTasks };
          }
          if (col.id === destColumn.id) {
            return { ...col, tasks: destTasks };
          }
          return col;
        });

        //db update preparation
        const updatedDestinationTasks = destTasks.map((task, index) => ({
          id: task.id,
          columnId: destColumn.id,
          sortOrder: index,
        }));
        const updatedSourceTasks = sourceTasks.map((task, index) => ({
          id: task.id,
          columnId: sourceColumn.id,
          sortOrder: index,
        }));
        reorderdTasks = [...updatedDestinationTasks, ...updatedSourceTasks];
      }

      // actual db update
      try {
        setReorderingTasks(true);
        reorderTask(reorderdTasks);
        setReorderingTasks(false);
      } catch (err) {
        console.error("Error reordering tasks:", err);
      }
    }
  };

  {
    /* Column Component */
  }
  function DraggableColumn({
    index,
    column,
  }: {
    index: number;
    column: ColumnWithTasks;
  }) {
    const [isEditingColumnTitle, setIsEditingColumnTitle] = useState(false);
    const [localColumnTitle, setLocalColumnTitle] = useState(column?.title);
    const columnTitleRef = useRef<HTMLSpanElement | null>(null);

    const [isAddingTask, setIsAddingTask] = useState(false);
    const [taskTitle, setTaskTitle] = useState("");

    useEffect(() => {
      if (column.title) {
        setLocalColumnTitle(column.title);
      }
    }, [column.title]);

    useEffect(() => {
      if (isEditingColumnTitle && columnTitleRef.current) {
        columnTitleRef.current.focus();
        // Optional: place cursor at the end of text
        const range = document.createRange();
        const selection = window.getSelection();
        range.selectNodeContents(columnTitleRef.current);
        range.collapse(false); // collapse to end
        if (selection) {
          selection.removeAllRanges();
        }
        if (selection) {
          selection.addRange(range);
        }
      }
    }, [isEditingColumnTitle]);

    const handleSave = async (newTitle: string) => {
      const trimmed = (newTitle || "").trim();
      if (!trimmed) {
        if (columnTitleRef.current) {
          columnTitleRef.current.textContent = localColumnTitle;
        }
        setIsEditingColumnTitle(false);
        return;
      }
      if (trimmed !== column.title) {
        try {
          updateColumnTitle({ columnId: column.id, newTitle: trimmed });
          setIsEditingColumnTitle(false);
        } catch (err) {
          console.error(err);
        }
      } else {
        setIsEditingColumnTitle(false);
      }
    };

    const handleCancel = () => {
      setIsEditingColumnTitle(false);
      setLocalColumnTitle(column.title);
    };

    async function handleCreateTask() {
      if (!taskTitle.trim()) return;
      try {
        setIsAddingTask(true);
        createTask({
          title: taskTitle,
          columnId: column.id,
          sortOrder: column.tasks.length,
        });
        setTaskTitle("");
        setIsAddingTask(false);
      } catch (err) {
        console.error(err);
      }
    }

    return (
      <Draggable draggableId={String(column.id)} index={index}>
        {(provided) => (
          <div className="px-2">
            <Card
              {...provided.draggableProps}
              ref={provided.innerRef}
              className="w-full sm:flex-shrink-0 sm:w-75 h-fit p-2 rounded-[6px] bg-zinc-100 dark:bg-black/40 shadow-xs shadow-gray-500 dark:shadow-none"
            >
              <div
                {...provided.dragHandleProps}
                className="flex items-center justify-between mb-2"
              >
                <div className="p-1">
                  <span
                    ref={columnTitleRef}
                    defaultValue={localProjectTitle || ""}
                    contentEditable={isEditingColumnTitle}
                    suppressContentEditableWarning
                    onClick={(e) => {
                      if (!isEditingColumnTitle) setIsEditingColumnTitle(true);
                    }}
                    onBlur={(e) => {
                      setIsEditingColumnTitle(false);
                      const newTitle = e.currentTarget.textContent || "";
                      handleSave(newTitle);
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
                    className={`text-lg w-full block font-[inter-bold] px-2 py-1 rounded-[4px] focus:outline-1 focus:outline-blue-500 hover:bg-black/10 dark:hover:bg-white/10 leading-snug break-words ${
                      !isEditingColumnTitle
                        ? "hover:cursor-pointer"
                        : "focus:cursor-text bg-white dark:bg-zinc-800"
                    }`}
                  >
                    {localColumnTitle}
                  </span>
                </div>

                <Button variant="ghost">
                  <MoreHorizontal size={15} />
                </Button>
              </div>
              <Droppable droppableId={String(column.id)} type="task">
                {(provided) => (
                  <ol
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    key={column.id}
                    className="py-[1px]"
                  >
                    {column.tasks.map((task, index) => (
                      <li key={task.id} className="my-2.5">
                        <SortableTask
                          index={index}
                          taskTitle={task.title}
                          taskId={task.id}
                          taskCompleted={task.completed}
                        ></SortableTask>
                      </li>
                    ))}
                    {provided.placeholder}
                  </ol>
                )}
              </Droppable>
              {!isAddingTask ? (
                <div className="p-1">
                  <Button
                    variant="ghost"
                    className="w-full rounded-[4px]"
                    onClick={() => setIsAddingTask(true)}
                  >
                    <Plus size={15} />
                    Add Task
                  </Button>
                </div>
              ) : (
                <div className="p-1">
                  <textarea
                    name=""
                    id=""
                    value={taskTitle}
                    onChange={(e) => setTaskTitle(e.target.value)}
                    className="resize-none w-full px-2 py-2 rounded-[4px] bg-zinc-50 dark:bg-zinc-800 border not-hover:border-blue-500 outline-none font-[inter] "
                    autoFocus
                  ></textarea>
                  <div className="flex space-x-2 items-center">
                    <Button
                      className="bg-blue-400 rounded-[4px] hover:bg-blue-300 text-zinc-900"
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
        )}
      </Draggable>
    );
  }

  {
    /* Task Component */
  }
  function SortableTask({
    index,
    taskTitle,
    taskId,
    taskCompleted,
  }: {
    index: number;
    taskTitle: string;
    taskId: string;
    taskCompleted: boolean;
  }) {
    const [addingTask, setAddingTask] = useState(false);
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);
    const DEBOUNCE_DELAY_MS = 300; // Adjust delay as needed
    const cardModal = useCardModal();

    React.useEffect(() => {
      return () => {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
      };
    }, []);

    return (
      <Draggable draggableId={taskId} index={index}>
        {(provided) => (
          <div
            {...provided.draggableProps}
            ref={provided.innerRef}
            className="group"
          >
            <Card className="relative flex items-center gap-2 rounded-[4px] mx-1 dark:bg-zinc-800 bg-[#f5f9ff] hover:cursor-pointer shadow-xs border-none shadow-gray-400 dark:shadow-none">
              <div
                id="sliding checkbox"
                onPointerDown={(e) => {
                  e.stopPropagation();
                  setTaskComplete({
                    taskId: taskId,
                    completed: !taskCompleted,
                  });
                }}
                className={`absolute h-4 w-4 ml-2 rounded-full border-1 border-zinc-900 dark:border-white flex items-center justify-center opacity-0 transition-all duration-200 group-hover:opacity-100  ${
                  taskCompleted
                    ? "bg-green-500 opacity-100 border-none"
                    : "bg-transparent"
                }`}
              >
                {taskCompleted && (
                  <Check size={10} className="text-white dark:text-zinc-900" />
                )}
              </div>
              <p
                {...provided.dragHandleProps}
                onClick={() => {
                  cardModal.onOpen(taskId);
                }}
                className={`transition-all w-full p-2 duration-200 group-hover:translate-x-5 ${
                  taskCompleted ? "translate-x-5" : ""
                }`}
              >
                {taskTitle}
              </p>
            </Card>
          </div>
        )}
      </Draggable>
    );
  }

  if (isLoading) {
    return (
      <div className="relative h-screen w-full">
        <Header visible={true} />
        <div className="absolute inset-0 h-screen flex items-center justify-center">
          <RippleWaveLoader />
        </div>
      </div>
    );
  }



  function handleCreateNewColumn(formData: FormData) {
    const newColumnTitle = formData.get("title") as string;
    const projectId = project!.id;
    const sortOrder = serverColumns.length;

    try {
      createColumn({ projectId, title: newColumnTitle, sortOrder });
      setIsAddingColumn(false);
    } catch (err) {
      console.error("Error creating column:", err);
    }
  }


  return (
    <div className="h-screen max-w-[100vw] font-[inter] flex flex-col items-center">
      <Header visible={true}/>
      {/* Everything after header */}
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="h-screen w-full flex flex-col "
      >
        {/* NavBar */}
        <nav className="bg-transparent backdrop-blur-2xl flex flex-col">
          <Button
            id="back-button"
            variant="ghost"
            className="w-fit mx-5"
            onClick={() => router.push("/projects")}
          >
            <MdKeyboardArrowLeft size={15} />
            Back to Projects
          </Button>
          <div className="flex items-center justify-between h-15">
            <span
              ref={projectTitleRef}
              defaultValue={localProjectTitle || ""}
              contentEditable={isEditingProjectTitle}
              suppressContentEditableWarning
              onClick={() => setIsEditingProjectTitle(true)}
              onBlur={(e) => {
                setIsEditingProjectTitle(false);
                const newTitle = e.currentTarget.textContent || "";
                handleProjectTitleSubmit(newTitle);
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
              className="text-2xl font-bold tracking-wide mx-5 p-1 px-2 max-w-[90%] truncate whitespace-nowrap rounded-[4px] focus:outline-1 focus:outline-blue-500 hover:bg-black/10 dark:hover:bg-white/10 hover:cursor-pointer focus:cursor-text"
            >
              {localProjectTitle}
            </span>

            <div className="px-3">
              <button
                className="dark:hover:bg-zinc-800 hover:bg-zinc-300 p-1 flex gap-1 items-center text-sm hover:cursor-pointer rounded-sm"
                onClick={() => onFilterClick()}
              >
                <BsFilter size={20}></BsFilter>
                {filterCount == 0 && (
                  <span className="text-[10px]">{filterCount}</span>
                )}
              </button>
            </div>
          </div>
        </nav>

        {/* Filter dialog */}
        <Dialog open={isFilterOpen} onOpenChange={setIsFilterOpen}>
          <DialogContent className="w-[95vw] max-w-[425px] mx-auto font-[inter]">
            <DialogHeader>
              <DialogTitle className="">Filter Tasks</DialogTitle>
              <p className="text-xs sm:text-sm text-zinc-600">
                Filter tasks by priority, due date or assignee
              </p>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2 max-sm:text-sm">
                <label htmlFor="">Priority</label>
                <div className="flex gap-2 mt-1">
                  {["low", "medium", "high"].map((priority, index) => (
                    <Button
                      key={index}
                      variant={"outline"}
                      size="default"
                      className="hover:cursor-pointer text-xs sm:text-sm"
                    >
                      {priority.charAt(0).toUpperCase() + priority.slice(1)}
                      <div
                        className={`h-2 w-2 rounded-xs ml-2 ${
                          priority === "low"
                            ? "bg-green-600"
                            : priority == "medium"
                              ? "bg-yellow-600"
                              : "bg-red-600"
                        }`}
                      ></div>
                    </Button>
                  ))}
                </div>
              </div>
              <div className="space-y-2 max-sm:text-sm">
                <label htmlFor="">Due Date</label>
                <div className="mt-1">
                  <Input
                    type="date"
                    className="rounded-sm border border-zinc-300 dark:border-zinc-800 px-3 py-2 mb-3 text-foreground shadow-sm shadow-black/5 transition-shadow dark:focus-visible:border-blue-500 focus-visible:border-blue-500 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                  ></Input>
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
          <section className="h-full flex max-sm:flex-col overflow-x-auto flex-1 overflow-auto custom-scrollbar">
            <DragDropContext onDragEnd={onDragEnd}>
              <Droppable
                droppableId="columns"
                type="column"
                direction="horizontal"
              >
                {(provided) => (
                  <ol
                    id="columns container"
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    className="flex max-sm:flex-col max-sm:space-x-0 max-sm:space-y-4"
                  >
                    {serverColumns.map((column, index) => (
                      <DraggableColumn
                        index={index}
                        key={column.id}
                        column={column}
                      >
                        {/* <ul>
                          {column.tasks.map((task, index) => (
                            <li key={index} className="mb-3">
                              <SortableTask
                                taskTitle={task.title}
                                taskId={task.id}
                                taskCompleted={task.completed}
                              ></SortableTask>
                            </li>
                          ))}
                        </ul> */}
                      </DraggableColumn>
                    ))}
                    {provided.placeholder}
                  </ol>
                )}
              </Droppable>
              {isAddingColumn ? (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    const formData = new FormData(e.currentTarget);
                    handleCreateNewColumn(formData);
                  }}
                >
                  <Card className="w-full sm:w-75 p-2 mx-2 space-y-4 rounded-[6px] bg-zinc-100 dark:bg-zinc-950 shadow-md shadow-gray-300 dark:shadow-none">
                    <input
                      name="title"
                      id=""
                      placeholder="Enter column title"
                      className="resize-none text-md w-full px-3 py-2 rounded-[4px] bg-zinc-50 dark:bg-zinc-800 border not-hover:border-blue-500 outline-none font-[inter] "
                      autoFocus
                    ></input>
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
                  className="p-3 rounded-[6px] bg-zinc-300 hover:bg-zinc-300/50 dark:bg-white/20 dark:hover:bg-white/10 backdrop-blur-[2px] text-md sm:flex-shrink-0 h-10 sm:w-75 flex items-center justify-center hover:cursor-pointer gap-1 mx-2"
                >
                  <Plus size={15} />
                  Add a column
                </button>
              )}
            </DragDropContext>
            <div>
              {reorderingColumns && (
                <p className="text-4xl font-[inter]">Reordering columns...</p>
              )}
              {reorderingTasks && (
                <p className="text-4xl font-[inter]">Reordering tasks...</p>
              )}
            </div>
          </section>
        </main>
      </motion.section>
    </div>
  );
};

export default Page;
