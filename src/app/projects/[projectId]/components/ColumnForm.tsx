"use client";

import { Button } from "@/components/ui/button";
import ColumnWrapper from "./ColumnWrapper";
import { Plus, X } from "lucide-react";
import { useState, useRef, ElementRef } from "react";
import { useEventListener, useOnClickOutside } from "usehooks-ts";
import { Card } from "@/components/ui/card";
import { useParams } from "next/navigation";
import { useProject } from "@/lib/hooks/useProjects";

const ColumnForm = () => {
  const params = useParams<{ projectId: string }>();
  const { createNewColumn } = useProject(params.projectId);

  const formRef = useRef<HTMLFormElement>(null!);
  const inputRef = useRef<HTMLInputElement>(null);

  const [isEditing, setIsEditing] = useState(false);

  const enableEditing = () => {
    setIsEditing(true);
  };

  const disableEditing = () => {
    setIsEditing(false);
  };

  const onKeyDown = (e: KeyboardEvent) => {
    if (e.key === "Escape") {
      disableEditing();
    }
  };
  useEventListener("keydown", onKeyDown);
  useOnClickOutside(formRef, disableEditing);

  async function handleSubmit(formData: FormData) {
    const title = formData.get("title") as string;
    console.log("this is good");
    disableEditing();
    await createNewColumn(title);
    console.log('created shit')
  }

  if (isEditing) {
    return (
      <ColumnWrapper>
        <form
          ref={formRef}
          onSubmit={(e) => {
            e.preventDefault();
            const formData = new FormData(e.currentTarget);
            handleSubmit(formData);
          }}
        >
          <Card className="w-full p-2 rounded-md  space-y-4 shadow-md">
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
                Add Task
              </Button>
              <Button
                variant="ghost"
                className="h-full p-2"
                onClick={disableEditing}
              >
                <X size={15} />
              </Button>
            </div>
          </Card>
        </form>
      </ColumnWrapper>
    );
  }

  return (
    <ColumnWrapper>
      <Button
        onClick={enableEditing}
        className="text-md w-full p-3 flex justify-start gap-2"
      >
        <Plus size={15} />
        Add a column
      </Button>
    </ColumnWrapper>
  );
};

export default ColumnForm;
