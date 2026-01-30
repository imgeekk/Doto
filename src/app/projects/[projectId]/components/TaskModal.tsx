"use client";

import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import RippleWaveLoader from "@/components/ui/ripple-loader";
import useCardModal from "@/hooks/use-task-modal";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { ComponentRef, useEffect, useRef, useState } from "react";
import { MdKeyboardArrowDown } from "react-icons/md";
import { updateTaskTitle } from "@/app/actions/services";

const TaskModal = () => {
  const id = useCardModal((state) => state.id);
  const isOpen = useCardModal((state) => state.isOpen);
  const onClose = useCardModal((state) => state.onClose);

  const queryClient = useQueryClient();
  const params = useParams();

  const inputRef = useRef<ComponentRef<"textarea">>(null);
  const onBlur = () => {
    inputRef.current?.form?.requestSubmit();
  };

  const onSubmit = async (formData: FormData) => {
    const newTitle = formData.get("title") as string;
    const taskId = params.taskId as string;

    if (!newTitle) return;
    if (newTitle === data.title) return;

    try {
      inputRef.current?.blur();
      await updateTaskTitle(newTitle, taskId);
    } catch (error) {
      console.log(error);
    }
  };

  const { data, isLoading } = useQuery({
    queryKey: ["tasks", id],
    queryFn: async () => {
      const res = await fetch(`/api/tasks/${id}`);

      if (!res.ok) {
        throw new Error("Failed to fetch task");
      }

      return res.json();
    },
  });

  const [title, setTitle] = useState("");
  const [newTitle, setNewTitle] = useState("");

  useEffect(() => {
    if (data?.title) {
      setTitle(data.title);
    }
  }, [data]);

  if (isLoading) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="w-[95vw] max-w-[425px] mx-auto font-[inter] top-[25%]">
          <RippleWaveLoader className="h-5 w-1" />
        </DialogContent>
      </Dialog>
    );
  }
  async function handleSave() {
    const trimmed = title.trim()
    if(!trimmed){
      setTitle(data.title)
      return;
    }

    if(trimmed !== data.title){
      try{
        inputRef.current?.blur();
        await updateTaskTitle(trimmed, id)
      }
      catch(error){
        console.error(error)
      }
    }
    else{
      return;
    }
  }

  function handleCancel() {
    setTitle(data.title);
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[95vw] max-w-[425px] mx-auto font-[inter] top-[25%]">
        <button className="text-black/90 font-semibold dark:text-white/75 bg-black/20 dark:bg-zinc-800 dark:hover:bg-zinc-700 hover:cursor-pointer w-fit p-1 px-1.5 rounded-sm text-sm">
          {data?.column.title}{" "}
          <MdKeyboardArrowDown className="inline-block text-xl" />
        </button>
        {/* <DialogTitle className="text-2xl">{data?.title}</DialogTitle> */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            onSubmit(new FormData(e.currentTarget));
          }}
        >
          <textarea
            name="title"
            ref={inputRef}
            value={title}
            rows={1}
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
            onChange={(e) => setTitle(e.currentTarget.value)}
            onInput={() => {
              if (!inputRef.current) return;
              inputRef.current.style.height = "auto";
              inputRef.current.style.height =
                inputRef.current.scrollHeight + "px";
            }}
            className="text-2xl font-bold px-2 py-1 w-full resize-none overflow-hidden focus:outline-1 focus:outline-blue-500 rounded-xs"
          ></textarea>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default TaskModal;
