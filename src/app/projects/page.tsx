"use client";
import { BsFilter, BsFilterRight } from "react-icons/bs";

import Header from "@/components/Header";
import { TabDemo } from "@/components/ui/tabs-in-cell-for-navigation";
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
import { FolderCard } from "@/components/folder-card";
import { FaFilter } from "react-icons/fa";
import { TbFilter } from "react-icons/tb";
import { GoFilter } from "react-icons/go";
import { BiSolidFilterAlt } from "react-icons/bi";
import { Button } from "@/components/ui/button-1";

const Page = () => {
  const router = useRouter();
  const { data, isPending } = authClient.useSession();
  const { createProject, projects, loading, error } = useProjects();

  useEffect(() => {
    if (!isPending && !data?.session) redirect("/signup");
  }, [isPending, data]);

  const handleClick = async () => {
    await createProject({ title: "New Proj" });
  };

  const folders = [
    {
      title: "First Project",
      description: "This is the first decsription",
      priority: "low",
      id: projects[0]?.id
    },
    {
      title: "Second Project",
      description: "This is the second decsription",
      priority: "medium",
      id: 2
    },
    {
      title: "Third Project",
      description: "This is the third decsription",
      priority: "low",
      id: 3
    },
    {
      title: "Fourth Project",
      description: "This is the fourth decsription",
      priority: "high",
      id: 4
    },
    {
      title: "Fifth Project",
      description: "This is the fifth decsription",
      priority: "medium",
      id: 5
    },
    {
      title: "Sixth Project",
      description: "This is the sixth decsription",
      priority: "high",
      id: 6
    },
  ];

  if(error){
    return (
      <div className="relative h-screen w-full">
        <Header visible={true}/>
        <div className="font-[intermed] absolute inset-0 h-screen flex items-center justify-center">
          <Button variant="inverse">Not my fault dude. Supabase isn't working</Button>
        </div>
      </div>
    );
  }
  if (loading) {
    return (
      <div className="relative h-screen w-full">
        <Header visible={true} />
        <div className="absolute inset-0 h-screen flex items-center justify-center">
         <RippleWaveLoader/>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen font-[inter] flex flex-col items-center dark:text-white/80">
      <Header visible={true} />
      <motion.main
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="w-full md:w-[80%] lg:w-[70%] xl:w-[60%] p-5 mt-5 text-md sm:text-lg"
      >
        {/* <h1 className="text-3xl mb-5 ">Your Workspace</h1> */}

        <section className="p-1">
            <h1 className="font-[400]">Total Projects{projects.length}</h1>
          <section className="">
            {/* <header className="flex items-center gap-1"><Clock size={18}/> Recently Viewed</header> */}
            <header className="flex items-center justify-between gap-1 mb-5">
              <p className="font-[intermed] text-2xl">Your Workspace</p>
              <p className="flex items-center text-md gap-1">
                <BsFilter size={16} />
                Filter
              </p>
            </header>
            <div className="min-h-15 grid xl:grid-cols-4 lg:grid-cols-3 md:grid-cols-3 max-md:grid-cols-2 auto-rows-[100px] gap-4">
              {projects.map((project, index) => (
                <Card
                  key={index}
                  className="p-3 dark:shadow-zinc-950 shadow-zinc-400 border-none hover:cursor-pointer hover:text-white"
                  onClick={() => router.push(`/projects/${project.id}`)}
                >
                  {project.title}
                </Card>

                // <div key={index} className="bg-gradient-to-b from-white-100/100 to-zinc-900/10 dark:from-cyan-950/100 dark:to-cyan-950/200 border-1 border-zinc-400/20 dark:border-cyan-950/40 rounded-md">{folder.title}</div>
                // <FolderCard key={index} title={folder.title} size="20" icon variant="high"></FolderCard>
              ))}
              <Card className="flex flex-col items-center justify-center bg-slate-100 p-3 border-slate-400/40 border-dashed dark:bg-[#1d1d28] dark:border-slate-500/40 hover:cursor-pointer">
                <Plus size={17} />
                Create new project
              </Card>
            </div>
          </section>
        </section>
        <div className="mt-10">
          <button onClick={handleClick} className="flex hover:cursor-pointer">
            <Plus />
            Create Project
          </button>
        </div>
      </motion.main>
    </div>
  );
};

export default Page;
