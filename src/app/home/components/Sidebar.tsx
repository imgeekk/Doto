"use client";

import { Activity } from "lucide-react";
import { useRouter } from "next/navigation";

import { FaFolderOpen, FaHome } from "react-icons/fa";


const Sidebar = () => {
  const router = useRouter();
  return (
    <div className="h-full overflow-y-auto w-70 p-5 pt-10 max-sm:hidden">
      <div onClick={() => router.push("/home/projects")} className="flex items-center gap-3 p-2 rounded-sm hover:bg-zinc-200 dark:hover:bg-zinc-800 cursor-pointer mb-1">
        <FaFolderOpen size={18}/>
        <h1>Projects</h1>
      </div>
      <div onClick={() => router.push("/home/activity")} className=" flex items-center gap-3 p-2 rounded-sm hover:bg-zinc-200 dark:hover:bg-zinc-800 cursor-pointer mb-1">
          <Activity size={18}/>
        <h1>Activity</h1>
      </div>
      <div onClick={() => router.push("/home")} className="flex items-center gap-3 p-2 rounded-sm hover:bg-zinc-200 dark:hover:bg-zinc-800 cursor-pointer mb-1">
      <FaHome size={18}/>
        <h1>Home</h1>
      </div>
    </div>
  );
};

export default Sidebar;
