"use client";

import { Button } from "@/components/ui/button-1";
import {
  Popover,
  PopoverClose,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import RippleWaveLoader from "@/components/ui/ripple-loader";
import { useProjects } from "@/lib/hooks/useProjects";
import { X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface FormPopoverProps {
  children: React.ReactNode;
  side?: "left" | "right" | "top" | "bottom";
  align?: "start" | "center" | "end";
  sideOffset?: number;
}

const FormPopover = ({
  children,
  side = "bottom",
  align,
  sideOffset = 0,
}: FormPopoverProps) => {
  const { createProject } = useProjects();
  const router = useRouter();

  const [loading, setLoading] = useState(false);

  const handleSubmit = async (formData: FormData) => {
    const newProjectTitle = formData.get("title") as string;
    setLoading(true);
    const projId = await createProject({ title: newProjectTitle })
    if(projId){
      router.push(`/projects/${projId}`)
    }
  };

  return (
    <Popover>
      <PopoverTrigger className="h-full w-full">{children}</PopoverTrigger>
      <PopoverContent
        align={align}
        className="w-80 pt-3 font-[inter]"
        side={side}
        sideOffset={sideOffset}
      >
        <div className="text-center pb-4 font-[intermed]">Create project</div>
        <PopoverClose asChild className="h-7 w-7">
          <Button
            variant="ghost"
            className="absolute top-2 right-2 hover:bg-zinc-300 dark:hover:bg-zinc-700"
          >
            <X />
          </Button>
        </PopoverClose>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const formData = new FormData(e.currentTarget);
            handleSubmit(formData);
          }}
        >
          <label className="text-sm">Project Title</label>
          <input
            name="title"
            id=""
            placeholder="Enter column title"
            className="resize-none text-sm w-full px-3 py-2 rounded-sm bg-zinc-50 dark:bg-zinc-800 border focus:border-blue-500 outline-none"
            autoFocus
          ></input>
          <Button type="submit" className="w-full rounded-sm mt-5" disabled={loading}>
            {loading ? <RippleWaveLoader className="h-3 w-1"/> :
            "Create"}
          </Button>
        </form>
      </PopoverContent>
    </Popover>
  );
};

export default FormPopover;
