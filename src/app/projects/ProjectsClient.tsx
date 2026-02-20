"use client";
import { BsFilter, BsFilterRight } from "react-icons/bs";

import Header from "@/components/Header";
import { ProjectsTabs } from "@/app/projects/ProjectsTab";
import { authClient } from "../lib/auth-client";
import { useEffect } from "react";
import { redirect, useRouter } from "next/navigation";
import { Clock, Filter, FilterIcon, FilterX, Plus } from "lucide-react";
import { useProjects } from "@/lib/hooks/useProjects";
import ProjectCard from "@/components/ProjectCard";
import ModifiedClassicLoader from "@/components/loader";
import RippleWaveLoader from "@/components/ui/ripple-loader";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button-1";

const ProjectClient = ({ user }: any) => {
  const router = useRouter();

  return (
    <div className="h-screen font-[monument] flex flex-col dark:text-white/90">
      <Header visible={true} />
      <motion.main
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex-1 w-full min-h-0 flex"
      >
        <aside className="max-sm:hidden w-64 border-r-1 flex flex-col pt-20 px-5">
          <h1 className="text-xl">{user.name}</h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            {user.email}
          </p>
          <p></p>
        </aside>
        <section className="flex-1 flex flex-col p-3">
            <header className="font-[monument] font-bold text-3xl mb-5">
              Your Workspace
            </header>
            <div className="relative flex-1 min-h-0 ">
             <ProjectsTabs userId={user.id} /> 
            </div>
          </section>
        {/* <div className="mt-10">
          <button onClick={handleClick} className="flex hover:cursor-pointer">
            <Plus />
            Create Project
          </button>
        </div> */}
      </motion.main>
    </div>
  );
};

export default ProjectClient;
