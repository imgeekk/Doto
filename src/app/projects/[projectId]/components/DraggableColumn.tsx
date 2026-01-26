"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ColumnWithTasks } from "@/config/model";
import { useProject } from "@/lib/hooks/useProjects";
import { MoreHorizontal, Plus, X } from "lucide-react";
import { useParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useEventListener, useOnClickOutside } from "usehooks-ts";

const DraggableColumn = ({
  index,
  column,
}: {
  index: number;
  column: ColumnWithTasks;
}) => {
  const params = useParams<{ projectId: string }>();
  const { createRealTask, updateColumnTitle } = useProject(params.projectId);
  const [isEditing, setIsEditing] = useState(false);
  const [newColumnTitle, setNewColumnTitle] = useState(column?.title || "");


  const formRef = useRef<HTMLFormElement>(null!);
  const inputRef = useRef<HTMLSpanElement>(null!);

  const enableEditing = () => {
    setNewColumnTitle(column?.title || "");
    setIsEditing(true);
    setTimeout(() => {
      inputRef.current?.focus();
    });
  };

  const disableEditing = () => {
    setIsEditing(false);
  };


  // const titleRef = useRef<HTMLSpanElement | null>(null);

  // const [isAddingTask, setIsAddingTask] = useState(false);
  // const [taskTitle, setTaskTitle] = useState("");

  // Keep local state in sync when column prop changes (e.g. after remote update)
  // useEffect(() => {
  //   if (!isEditing) {
  //     setNewColumnTitle(column?.title || "");
  //     console.log("done:", column?.title, newColumnTitle);
  //   }
  // }, [column?.title, isEditing]);

  // // When edit mode starts, initialize the span's DOM content and focus + move caret to end
  useEffect(() => {
    if (isEditing && inputRef.current) {
      // Put initial text into the DOM once (do NOT render state inside span while editing)
      inputRef.current.innerText = newColumnTitle || "";

      // Focus and move caret to end
      inputRef.current.focus();
      const range = document.createRange();
      range.selectNodeContents(inputRef.current);
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
      return;
    }
    if (trimmed !== column.title) {
      try {
        inputRef.current?.blur();
        await updateColumnTitle(column.id, trimmed); // your hook function
        console.log("updated column title to:", trimmed, "now it is: ", column.title);
        disableEditing();
      } catch (err) {
        // optionally handle error / revert UI
        console.error(err);
        setNewColumnTitle(column.title);
      }
    } else {
      // no change
      setNewColumnTitle(column.title);
    }
  };

  const handleCancel = () => {
    disableEditing();
    setNewColumnTitle(column.title);
  };

  // async function handleCreateTask() {
  //   try {
  //     setIsAddingTask(false);
  //     await createRealTask(column.id, { title: taskTitle }).then(() =>
  //       console.log("added nig check db")
  //     );
  //   } catch (err) {
  //     console.error(err);
  //   }
  // }





  return (
    <Card className={`w-full sm:flex-shrink-0 sm:w-70 h-fit p-2 rounded-md `}>
      <div>
        <header className="flex items-center justify-between">
        {isEditing ? (
            <form className="flex-1 ">
               <span
                  ref={inputRef}
                  contentEditable
                  suppressContentEditableWarning
                  autoFocus
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
                  className="block pl-2.5 py-1 rounded-sm  focus-within:outline-blue-500 focus-within:outline-1 font-[intermed] bg-transparent"
                  style={{
                    whiteSpace: "pre-wrap",
                    wordBreak: "break-word",
                    overflowWrap: "break-word",
                  }}
                />
            </form>
        ):(
          <div
            className="px-2.5 py-1 w-full dark:hover:bg-zinc-800 hover:bg-zinc-200 hover:cursor-pointer font-[intermed] rounded-sm"
            onClick={() => {
              enableEditing();
            }}
          >
            {column?.title}
          </div>
          )}
            <button className="hover:bg-zinc-800 transition-all duration-130 px-2.5 py-2 rounded-sm cursor-pointer"><MoreHorizontal size={15}/></button>
          

          {/* <Button variant="ghost">
            <MoreHorizontal size={15} />
          </Button> */}
        </header>
      </div>
    </Card>
  );
};

export default DraggableColumn;
