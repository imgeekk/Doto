"use client";

import Header from "@/components/Header";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { useProject } from "@/lib/hooks/useProjects";
import { Check, Edit, MoreHorizontal, Plus, X } from "lucide-react";
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
import { MdDeleteOutline, MdKeyboardArrowLeft } from "react-icons/md";
import { useQueryClient } from "@tanstack/react-query";
import useTaskModal from "@/hooks/use-task-modal";
import {
  Dropdown,
  DropdownTrigger,
  DropdownContent,
  DropdownItem,
  DropdownSeparator,
} from "@/components/basic-dropdown";
import { reorderColumns, reorderTasks } from "@/app/actions/services";
import { CgDetailsMore } from "react-icons/cg";

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
    moveTask,
    // createNewColumn,
  } = useProject(params.projectId);

  const [localColumns, setLocalColumns] = useState<ColumnWithTasks[]>(
    columns || [],
  );

  useEffect(() => {
    if (columns) {
      setLocalColumns(columns);
    }
  }, [columns]);

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

  const queryClient = useQueryClient();
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
      const newColumns = [...localColumns];
      const [movedColumn] = newColumns.splice(source.index, 1);
      newColumns.splice(destination.index, 0, movedColumn);

      // local update
      setLocalColumns(newColumns);

      //cache update
      queryClient.setQueryData(["project", project!.id], (old: any) => {
        if (!old) return old;

        return {
          ...old,
          columnsWithTaks: newColumns,
        };
      });

      //db update
      const columnUpdates = newColumns.map((col, index) => ({
        id: col.id,
        sortOrder: index,
      }));

      await reorderColumns(project!.id, columnUpdates);

      return;
    }

    // Handle task reordering
    if (type === "task") {
      const newColumns = [...localColumns];

      const sourceColumnIndex = newColumns.findIndex(
        (col) => col.id === source.droppableId,
      );
      const destinationColumnIndex = newColumns.findIndex(
        (col) => col.id === destination.droppableId,
      );

      const sourceCol = newColumns[sourceColumnIndex];
      const destinationCol = newColumns[destinationColumnIndex];

      //same column reordering
      if (sourceColumnIndex === destinationColumnIndex) {
        const newTasks = [...sourceCol.tasks];
        const [movedTask] = newTasks.splice(source.index, 1);
        newTasks.splice(destination.index, 0, movedTask);
        newColumns[sourceColumnIndex].tasks = newTasks;

        newColumns[sourceColumnIndex].tasks = newTasks;
      }

      //different column reordering
      else {
        const sourceTasks = [...sourceCol.tasks];
        const destTasks = [...destinationCol.tasks];

        const [movedTask] = sourceTasks.splice(source.index, 1);
        destTasks.splice(destination.index, 0, movedTask);

        newColumns[sourceColumnIndex].tasks = sourceTasks;
        newColumns[destinationColumnIndex].tasks = destTasks;

        // cache update for task modal
        queryClient.setQueryData(["task", movedTask.id], (old: any) => {
          if (!old) return old;

          return {
            ...old,
            columnId: destinationCol.id,
            column: {
              ...old.column,
              id: destinationCol.id,
              title: destinationCol.title,
            },
          };
        });
      }

      // local update
      setLocalColumns(newColumns);

      // cache update
      queryClient.setQueryData(["project", project!.id], (old: any) => {
        if (!old) return old;

        return {
          ...old,
          columns: newColumns,
        };
      });

      // db update
      const updates: { id: string; columnId: string; sortOrder: number }[] = [];

      newColumns.forEach((col: ColumnWithTasks) => {
        col.tasks.forEach((task: Task, index: number) => {
          updates.push({
            id: task.id,
            columnId: col.id,
            sortOrder: index,
          });
        });
      });

      await reorderTasks(updates);

      return;
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

    function handleDeleteColumn(columnId: string) {
      deleteColumn(columnId);
    }

    return (
      <Draggable draggableId={String(column.id)} index={index}>
        {(provided) => (
          <Card
            {...provided.draggableProps}
            ref={provided.innerRef}
            className="w-75 mx-2 sm:flex-shrink-0 h-fit p-2 rounded-[6px] bg-[#F7F5F6] dark:bg-[#161616] shadow-xs border-0 dark:border-1 dark:border-white/5 shadow-gray-400 dark:shadow-black/80"
          >
            <div
              {...provided.dragHandleProps}
              className="flex items-center justify-between mb-2 !cursor-pointer"
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
                  className={`text-lg w-full block font-[inter-med] px-2 py-1 rounded-[4px] focus:outline-1 focus:outline-blue-500 hover:bg-black/10 dark:hover:bg-white/10 leading-snug break-words ${
                    !isEditingColumnTitle
                      ? "hover:cursor-pointer"
                      : "focus:cursor-text bg-white dark:bg-zinc-800"
                  }`}
                >
                  {localColumnTitle}
                </span>
              </div>

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
                    onClick={() => handleDeleteColumn(column.id)}
                  >
                    <MdDeleteOutline className="h-5 w-5" />
                    <p className="">Delete</p>
                  </DropdownItem>
                </DropdownContent>
              </Dropdown>
            </div>
            <Droppable droppableId={String(column.id)} type="task">
              {(provided) => (
                <ol
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className="py-[1px]"
                >
                  {column.tasks.map((task, index) => (
                    <SortableTask
                      index={index}
                      key={task.id}
                      task={task}
                      taskTitle={task.title}
                      taskId={task.id}
                      taskCompleted={task.completed}
                    ></SortableTask>
                  ))}
                  {provided.placeholder}
                </ol>
              )}
            </Droppable>
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
                  name=""
                  id=""
                  value={taskTitle}
                  onChange={(e) => setTaskTitle(e.target.value)}
                  className="resize-none w-full px-2 py-2 rounded-[4px] bg-zinc-50 dark:bg-zinc-800 border not-hover:border-blue-500 outline-none font-[inter] max-sm:text-sm"
                  autoFocus
                ></textarea>
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
        )}
      </Draggable>
    );
  }

  {
    /* Task Component */
  }
  function SortableTask({
    index,
    task,
    taskTitle,
    taskId,
    taskCompleted,
  }: {
    index: number;
    task: Task;
    taskTitle: string;
    taskId: string;
    taskCompleted: boolean;
  }) {
    const [addingTask, setAddingTask] = useState(false);
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);
    const DEBOUNCE_DELAY_MS = 300; // Adjust delay as needed
    const taskModal = useTaskModal();

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
            className="group mb-2.5"
          >
            <Card className="flex flex-col rounded-[4px] mx-1 dark:bg-[#1F1F1F] bg-[#ffffff] hover:cursor-pointer shadow-xs border-none dark:border-white/5 shadow-gray-400 dark:shadow-black/80">
              <div className="flex">
                <span
                  id="task-title"
                  {...provided.dragHandleProps}
                  onClick={() => {
                    taskModal.onOpen(taskId);
                  }}
                  className="flex-1 flex items-center min-w-0 max-sm:text-sm leading-snug break-words p-2 !cursor-pointer"
                >
                  {taskTitle}
                </span>
                <div
                  id="checkbox-container"
                  className="flex p-3 items-start justify-center"
                >
                  <div
                    id="checkbox"
                    onClick={(e) => {
                      e.stopPropagation();
                      setTaskComplete({
                        taskId: taskId,
                        completed: !taskCompleted,
                      });
                    }}
                    className={`w-4 h-4 rounded-xs border-1 border-black/30 dark:border-white/30 flex items-center justify-center ${taskCompleted ? "bg-blue-500 border-none" : "bg-transparent"}`}
                  >
                    {taskCompleted && (
                      <Check size={15} className="text-white dark:text-black" />
                    )}
                  </div>
                </div>
              </div>
              {task.description &&
              <section className="flex items-center justify-start flex-wrap px-3 pb-2 text-black/40 dark:text-white/50">
              <CgDetailsMore size={16} />
              </section>
  }
            </Card>
          </div>
        )}
      </Draggable>
    );
  }

  if (isLoading) {
    return (
      <div className="relative h-screen w-full">
        <Header visible={true}  className="mb-5"/>
        <div className="absolute inset-0 h-screen flex items-center justify-center">
          <RippleWaveLoader />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="relative h-screen w-full">
        <Header visible={true}  className="mb-5"/>
        <div className="absolute inset-0 h-screen flex items-center justify-center">
          <h1 className="text-sm font-[inter] tracking-tighter text-black/70 dark:text-white/70">Yo dawg wsg. Oh about the error.. couldn't fetch it twin :(</h1>
        </div>
      </div>
    );
  }

  function handleCreateNewColumn(formData: FormData) {
    const newColumnTitle = formData.get("title") as string;
    const projectId = project!.id;
    const sortOrder = columns.length;

    try {
      createColumn({ projectId, title: newColumnTitle, sortOrder });
      setIsAddingColumn(false);
    } catch (err) {
      console.error("Error creating column:", err);
    }
  }

  return (
    <div className="h-screen max-w-[100vw] font-[inter] flex flex-col items-center">
      <Header visible={true} className="mb-5" />
      {/* Everything after header */}
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
              className="text-2xl sm:text-3xl font-[inter-bold] p-1 px-2 max-w-[90%] truncate whitespace-nowrap rounded-[4px] focus:outline-1 focus:outline-blue-500 hover:bg-black/10 dark:hover:bg-white/10 focus:bg-transparent dark:focus:bg-transparent hover:cursor-pointer focus:cursor-text"
            >
              {localProjectTitle}
            </span>

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
        </nav>

        {/* Filter dialog */}
        <Dialog open={isFilterOpen} onOpenChange={setIsFilterOpen}>
          <DialogContent className="w-[95vw] max-w-[425px] mx-auto font-[inter]nt]">
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
          <section className="h-full flex overflow-x-auto flex-1 overflow-auto custom-scrollbar">
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
                    className="flex"
                  >
                    {localColumns.map((column, index) => (
                      <DraggableColumn
                        index={index}
                        key={column.id}
                        column={column}
                      ></DraggableColumn>
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
                  <Card className="w-75 p-2 mx-2 space-y-4 rounded-[6px] bg-[#F7F5F6] dark:bg-[#161616] shadow-xs border-0 dark:border-1 dark:border-white/5 shadow-gray-400 dark:shadow-black/80">
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
                  className="p-3 rounded-[6px] bg-black/20 hover:bg-black/10 dark:bg-white/20 dark:hover:bg-white/10 backdrop-blur-[2px] text-md sm:flex-shrink-0 h-10 min-w-75 flex items-center justify-center hover:cursor-pointer gap-1 mx-2"
                >
                  <Plus size={15} />
                  Add a column
                </button>
              )}
            </DragDropContext>
          </section>
        </main>
      </motion.section>
    </div>
  );
};

export default Page;
