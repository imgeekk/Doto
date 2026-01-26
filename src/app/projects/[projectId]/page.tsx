"use client";

import Header from "@/components/Header";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { useProject } from "@/lib/hooks/useProjects";
import {
  ArrowLeft,
  Check,
  Cross,
  CrossIcon,
  Edit,
  MoreHorizontal,
  Plus,
  PlusIcon,
  X,
} from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { BiLeftArrow } from "react-icons/bi";
import RippleWaveLoader from "@/components/ui/ripple-loader";
import React, { ReactNode, useEffect, useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import { BsFilter } from "react-icons/bs";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ColumnWithTasks, Task } from "@/config/model";
import { DragDropContext, Draggable, Droppable } from "@hello-pangea/dnd";
import { Badge } from "@/components/badge-2";
import { useOnClickOutside } from "usehooks-ts";
import { set } from "better-auth";
import { reorderColumns, reorderTasks } from "@/app/actions/services";

const Page = () => {
  const router = useRouter();
  const params = useParams<{ projectId: string }>();
  const {
    project,
    columns,
    loading,
    error,
    updateProjectTitle,
    createRealTask,
    updateColumnTitle,
    setTaskComplete,
    setColumns,
    moveTask,
    createNewColumn,
  } = useProject(params.projectId);

  const [isEditingProjectTitle, setIsEditingProjectTitle] = useState(false);

  const [newProjectTitle, setNewProjectTitle] = useState(project?.title || "");

  const projectTitleSpanRef = useRef<HTMLSpanElement>(null);
  const projectTitleInputRef = useRef<HTMLInputElement>(null);
  const [filterCount, setFilterCount] = useState(0);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [activeTaskId, setActiveTaskId] = useState<number | null>(null);
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [isAddingColumn, setIsAddingColumn] = useState(false);
  const [reorderingColumns, setReorderingColumns] = useState(false);
  const [reorderingTasks, setReorderingTasks] = useState(false);

  const [dragActiveTask, setDragActiveTask] = useState<Task | null>(null);

  const onFilterClick = () => {
    setIsFilterOpen(true);
  };

  useEffect(() => {
    if (
      isEditingProjectTitle &&
      projectTitleSpanRef.current &&
      projectTitleInputRef.current
    ) {
      projectTitleSpanRef.current.textContent = newProjectTitle || " ";
      projectTitleInputRef.current.style.width = `${
        projectTitleSpanRef.current.offsetWidth + 2
      }px`;
    }
  }, [isEditingProjectTitle, newProjectTitle]);

  const handleProjectTitleSubmit = async () => {
    if (!newProjectTitle.trim() || !project) {
      setIsEditingProjectTitle(false);
      return;
    }

    if (newProjectTitle === project.title) {
      setIsEditingProjectTitle(false);
      return;
    }
    try {
      projectTitleInputRef.current?.blur();
      await updateProjectTitle(project.id, newProjectTitle);
      setIsEditingProjectTitle(false);
    } catch (error) {
      console.log(error);
    }
    setIsEditingProjectTitle(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleProjectTitleSubmit();
    }
  };

  const handleBlur = () => {
    handleProjectTitleSubmit();
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

  const onDragEnd = async(result: any) => {
    const { source, destination, type } = result;

    // dropped outside the list
    if (!destination) {
      return;
    }

    if(source.droppableId === destination.droppableId && source.index === destination.index){
      return;
    }

    // Handle column reordering
    if (type === "column") {
      const newColumns = Array.from(columns);
      const [movedColumn] = newColumns.splice(source.index, 1);
      newColumns.splice(destination.index, 0, movedColumn);
      setColumns(newColumns);

      //db update preparation
      const reorderedColumns = newColumns.map((col, index) => ({
        id: col.id,
        sortOrder: index,
      }));

      try {
        setReorderingColumns(true);
        await reorderColumns(project!.id, reorderedColumns);
        setReorderingColumns(false);
      } catch (err) {
        console.error("Error reordering columns:", err);
      }

      return;
    }

    // Handle task reordering
    if (type === "task") {

      let reorderdTasks = [];

      if (source.droppableId === destination.droppableId) {
        // Reordering within the same column
        const column = columns.find((col) => col.id === source.droppableId);
        if (!column) return;
        const newTasks = Array.from(column.tasks);
        const [movedTask] = newTasks.splice(source.index, 1);
        newTasks.splice(destination.index, 0, movedTask);
        const newColumns = columns.map((col) =>
          col.id === column.id ? { ...col, tasks: newTasks } : col
        );
        setColumns(newColumns);

        //db update preparation
        reorderdTasks = newTasks.map((task, index) => ({
          id: task.id,
          columnId: column.id,
          sortOrder: index,
        }));
      }
      else {
        // Moving task between columns
        const sourceColumn = columns.find(
          (col) => col.id === source.droppableId
        );
        const destColumn = columns.find(
          (col) => col.id === destination.droppableId
        );
        if (!sourceColumn || !destColumn) return;
        const sourceTasks = Array.from(sourceColumn.tasks);
        const destTasks = Array.from(destColumn.tasks);
        const [movedTask] = sourceTasks.splice(source.index, 1);
        destTasks.splice(destination.index, 0, movedTask);
        const newColumns = columns.map((col) => {
          if (col.id === sourceColumn.id) {
            return { ...col, tasks: sourceTasks };
          }
          if (col.id === destColumn.id) {
            return { ...col, tasks: destTasks };
          }
          return col;
        });
        setColumns(newColumns);

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
        await reorderTasks(reorderdTasks);
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
    const [isEditing, setIsEditing] = useState(false);
    const [newColumnTitle, setNewColumnTitle] = useState(column?.title || "");
    const titleRef = useRef<HTMLSpanElement | null>(null);

    const [isAddingTask, setIsAddingTask] = useState(false);
    const [taskTitle, setTaskTitle] = useState("");

    // Keep local state in sync when column prop changes (e.g. after remote update)
    useEffect(() => {
      if (!isEditing) {
        setNewColumnTitle(column?.title || "");
      }
    }, [column?.title, isEditing]);

    // When edit mode starts, initialize the span's DOM content and focus + move caret to end
    useEffect(() => {
      if (isEditing && titleRef.current) {
        // Put initial text into the DOM once (do NOT render state inside span while editing)
        titleRef.current.innerText = newColumnTitle || "";

        // Focus and move caret to end
        titleRef.current.focus();
        const range = document.createRange();
        range.selectNodeContents(titleRef.current);
        range.collapse(false);
        const sel = window.getSelection();
        sel?.removeAllRanges();
        sel?.addRange(range);
      }
    }, [isEditing]); // run only when editing mode flips

    const handleSave = async () => {
      const trimmed = (newColumnTitle || "").trim();
      if (!trimmed) {
        // revert if empty
        setNewColumnTitle(column.title);
        setIsEditing(false);
        return;
      }
      if (trimmed !== column.title) {
        try {
          titleRef.current?.blur();
          await updateColumnTitle(column.id, trimmed); // your hook function
          setIsEditing(false);
        } catch (err) {
          // optionally handle error / revert UI
          console.error(err);
          setNewColumnTitle(column.title);
        }
      } else {
        // no change
        setNewColumnTitle(column.title);
        setIsEditing(false);
      }
    };

    const handleCancel = () => {
      setIsEditing(false);
      setNewColumnTitle(column.title);
    };

    async function handleCreateTask() {
      try {
        setIsAddingTask(false);
        await createRealTask(column.id, { title: taskTitle }).then(() =>
          console.log("added nig check db")
        );
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
            className="w-full sm:flex-shrink-0 sm:w-75 h-fit p-2 rounded-lg bg-zinc-100 dark:bg-zinc-950 shadow-xs shadow-gray-500 dark:shadow-none"
          >
            <div
              {...provided.dragHandleProps}
              className="flex items-center justify-between"
            >
              <div className="p-1">
                {isEditing ? (
                  // contentEditable span: do NOT render newColumnTitle inside JSX while editing
                  <span
                    ref={titleRef}
                    contentEditable
                    suppressContentEditableWarning
                    onInput={(e) =>
                      setNewColumnTitle(e.currentTarget.textContent || "")
                    }
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleSave();
                      } else if (e.key === "Escape") {
                        e.preventDefault();
                        handleCancel();
                      }
                    }}
                    onBlur={() => {
                      // Save on blur
                      handleSave();
                    }}
                    autoFocus
                    className="p-2 block rounded-sm  focus-within:outline-blue-500 focus-within:outline-1 font-[intermed] max-w-50 bg-transparent"
                    style={{
                      whiteSpace: "pre-wrap",
                      wordBreak: "break-word",
                      overflowWrap: "break-word",
                    }}
                  />
                ) : (
                  <p
                    className="p-2 dark:hover:bg-zinc-800 hover:bg-zinc-200 hover:cursor-pointer rounded-sm max-w-50 whitespace-normal overflow-visible break-words font-[intermed]"
                    onClick={() => {
                      setIsEditing(true);
                      // initialize local state; effect will set innerText and focus
                      setNewColumnTitle(column?.title || "");
                    }}
                  >
                    {column?.title}
                  </p>
                )}
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
                  className="py-[1px]"
                >
                  {column.tasks.map((task, index) => (
                    <li key={index} className="my-2.5">
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
                  className="w-full"
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
                  className="resize-none w-full px-3 py-2 rounded-sm bg-zinc-50 dark:bg-zinc-800 border not-hover:border-blue-500 outline-none font-[inter] "
                  autoFocus
                ></textarea>
                <div className="flex space-x-2 items-center">
                  <Button
                    className="bg-blue-400 hover:bg-blue-300 text-zinc-900"
                    onClick={handleCreateTask}
                  >
                    Add Task
                  </Button>
                  <Button
                    variant="ghost"
                    className="h-full p-2"
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
    const [completed, setCompleted] = useState(taskCompleted);
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);
    const DEBOUNCE_DELAY_MS = 300; // Adjust delay as needed

    async function handleSetComplete() {
      // 1. Calculate the intended final state for this click
      const newCompletedState = !completed;

      // ⚡️ 2. OPTIMISTIC UPDATE: Update UI instantly
      setCompleted(newCompletedState);

      // 🛑 3. CLEAR PREVIOUS DEBOUNCE: Cancel any waiting API call
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      // 4. SCHEDULE NEW DEBOUNCED API CALL
      // We wrap the async logic in a function that receives the final intended state
      // as it exists *right now* (newCompletedState).
      // timeoutRef.current = setTimeout(async () => {
        try {
          // Use the stable 'newCompletedState' value captured when the function was scheduled
          await setTaskComplete(taskId, newCompletedState);
          console.log(
            `API call successful for final state: ${newCompletedState}`
          );

          // NOTE: If the setTaskComplete function is already updating your global
          // 'columns' state via the useProject hook, you may not need to do anything else.
        } catch (err) {
          console.error("API update failed, rolling back UI:", err);

          // 5. ROLLBACK on FAILURE: Only revert the state if the API call failed.
          // Revert back to the state *before* the optimistic update (which is !newCompletedState)
          setCompleted(!newCompletedState);
        } finally {
          timeoutRef.current = null;
        }
      // }, DEBOUNCE_DELAY_MS);
    }

    React.useEffect(() => {
      return () => {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
      };
    }, []);

    const MotionCard = motion.create(Card);

    return (
      <Draggable draggableId={taskId} index={index}>
        {(provided) => (
          <div
            {...provided.draggableProps}
            {...provided.dragHandleProps}
            ref={provided.innerRef}
            className="group"
          >
            <Card className="relative flex items-center gap-2 p-2 rounded-sm mx-1 dark:bg-zinc-800 bg-[#f5f9ff] hover:cursor-pointer shadow-xs border-none shadow-gray-400 dark:shadow-none"
            onClick={() => {
              setIsTaskModalOpen(true);

            }}
            >
              <div
                id="sliding checkbox"
                onClick={(e) => {
                  e.stopPropagation();
                  handleSetComplete();
                }}
                className={`absolute h-4 w-4 border-1 border-zinc-900 dark:border-white rounded-full flex items-center justify-center opacity-0 transition-all duration-200 group-hover:opacity-100  ${
                  completed
                    ? "bg-green-500 opacity-100 border-none"
                    : "bg-transparent"
                }`}
                style={{ pointerEvents: "auto", touchAction: "none" }}
              >
                {completed && (
                  <Check size={10} className="text-white dark:text-zinc-900" />
                )}
              </div>
              <p
                className={`transition-all duration-200 group-hover:pl-6 ${
                  completed ? "pl-6" : ""
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

  if (loading) {
    return (
      <div className="relative h-screen w-full">
        <Header visible={true} />
        <div className="absolute inset-0 h-screen flex items-center justify-center">
          <RippleWaveLoader />
        </div>
      </div>
    );
  }

  async function handleNewColumnFormSubmit(formData: FormData) {
    const newColumnTitle = formData.get("title") as string;
    await createNewColumn(newColumnTitle);
    setIsAddingColumn(false);
  }

  // function TaskOverlay({ activeTask }: { activeTask: Task }) {
  //   return (
  //     <div>
  //       <Card className="p-2 rounded-sm mx-1 dark:bg-zinc-800 bg-zinc-100 hover:cursor-grabbing rotate-3 [mask-image:radial-gradient(circle,_white_30%,_transparent_100%)] ">
  //         {activeTask.title}
  //       </Card>
  //     </div>
  //   );
  // }
  //Drag functions
  // Track which task is being dragged (optional UI highlight)

  return (
    <div className="h-screen max-w-[100vw] font-[inter] flex flex-col items-center">
      <Header visible={true} />
      {/* Everything after header */}
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="h-screen w-full flex flex-col "
      >
        {/* NavBar */}
        <nav className="bg-transparent backdrop-blur-2xl">
          
          <div className="flex items-center justify-between h-15">
            
            <div className="sm:text-2xl text-xl font-[intermed] px-5">
              
              {isEditingProjectTitle ? (
                <div className="inline-block relative">
                  <span
                    ref={projectTitleSpanRef}
                    className="absolute invisible whitespace-pre px-2 sm:text-2xl text-xl font-[intermed] max-w-[70vw]"
                  />
                  <input
                    ref={projectTitleInputRef}
                    type="text"
                    value={newProjectTitle}
                    onChange={(e) => {
                      const val = e.target.value;
                      setNewProjectTitle(val);

                      if (projectTitleSpanRef.current) {
                        projectTitleSpanRef.current.textContent = val || " ";
                        e.target.style.width = `${
                          projectTitleSpanRef.current.offsetWidth + 2
                        }px`;
                      }
                    }}
                    onKeyDown={handleKeyDown}
                    onBlur={handleBlur}
                    autoFocus
                    onFocus={(e) => e.target.select()}
                    className="p-2 flex rounded-sm focus-within:outline-blue-500 focus-within:outline-1"
                    style={{ width: "auto" }}
                  />
                </div>
              ) : (
                <h1
                  className="p-2 dark:hover:bg-zinc-800 hover:bg-zinc-300 hover:cursor-pointer rounded-sm max-w-[70vw] truncate whitespace-nowrap overflow-hidden"
                  onClick={() => {
                    setIsEditingProjectTitle(true);
                    setNewProjectTitle(project?.title || "");
                  }}
                >
                  {project?.title}
                </h1>
              )}
            </div>
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

        <Dialog open={isTaskModalOpen} onOpenChange={setIsTaskModalOpen}>
          <DialogContent className="w-[95vw] max-w-[425px] mx-auto font-[inter] top-[30%]">
              <header className="bg-red-600">
              </header>
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
                    {columns.map((column, index) => (
                      <DraggableColumn
                        index={index}
                        key={index}
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
                    handleNewColumnFormSubmit(formData);
                  }}
                >
                  <Card className="w-full sm:w-75 p-2 mx-2 space-y-4 rounded-lg bg-zinc-100 dark:bg-zinc-950 shadow-md shadow-gray-300 dark:shadow-none">
                    <input
                      name="title"
                      id=""
                      placeholder="Enter column title"
                      className="resize-none text-md w-full px-3 py-2 rounded-sm bg-zinc-50 dark:bg-zinc-800 border not-hover:border-blue-500 outline-none font-[inter] "
                      autoFocus
                    ></input>
                    <div className="flex space-x-2 items-center">
                      <Button
                        type="submit"
                        className="bg-blue-400 hover:bg-blue-300 text-zinc-900"
                      >
                        Add Column
                      </Button>
                      <Button
                        variant="ghost"
                        className="h-full p-2"
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
                  className="p-3 rounded-md bg-zinc-300 hover:bg-zinc-300/50 dark:bg-white/20 dark:hover:bg-white/10 backdrop-blur-[2px] text-md sm:flex-shrink-0 h-10 sm:w-75 flex items-center justify-center hover:cursor-pointer gap-1 mx-2"
                >
                  <Plus size={15} />
                  Add a column
                </button>
              )}
            </DragDropContext>
            <div>
              { reorderingColumns && <p className="text-4xl font-[inter]">Reordering columns...</p> }
              { reorderingTasks && <p className="text-4xl font-[inter]">Reordering tasks...</p> }
            </div>
          </section>
        </main>
      </motion.section>
    </div>
  );
};

export default Page;
