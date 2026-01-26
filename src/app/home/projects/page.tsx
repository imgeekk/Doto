"use client";

import { Card } from "@/components/ui/card";
import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { BsFilter } from "react-icons/bs";
import FormPopover from "./components/FormPopover";
import { useProjects } from "@/lib/hooks/useProjects";
import RippleWaveLoader from "@/components/ui/ripple-loader";

const Page = () => {
  const router = useRouter();
  const {projects, loading, error} = useProjects()

  const folders = [
    {
      title: "First Project",
      description: "This is the first decsription",
      priority: "low",
      id: 1,
    },
    {
      title: "Second Project",
      description: "This is the second decsription",
      priority: "medium",
      id: 2,
    },
    {
      title: "Third Project",
      description: "This is the third decsription",
      priority: "low",
      id: 3,
    },
    {
      title: "Fourth Project",
      description: "This is the fourth decsription",
      priority: "high",
      id: 4,
    },
    {
      title: "Fifth Project",
      description: "This is the fifth decsription",
      priority: "medium",
      id: 5,
    },
    {
      title: "Sixth Project",
      description: "This is the sixth decsription",
      priority: "high",
      id: 6,
    },
  ];

  // if (loading) {
  //   return (
  //       <div className="h-screen flex items-center justify-center">
  //         <RippleWaveLoader />
  //       </div>
  //   );
  // }
  return (
    <Card className="bg-[#eaedf2] h-full rounded-md  dark:shadow-zinc-950 dark:border-1">
      <div className="h-full p-8">
        <section className="p-1 h-full overflow-y-auto">
          <section className="h-full">
            <header className="flex items-center justify-between gap-1 mb-5">
              <p className="font-[intermed] text-xl">Your Workspace</p>
              <p className="flex items-center text-md gap-1">
                <BsFilter size={16} />
                Filter
              </p>
            </header>
            {loading ? <div className="h-[80%] w-full flex items-center justify-center"><RippleWaveLoader/></div> :
            <div
              className="grid grid-cols-2 grid-xs-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 2xl:grid-cols-5 auto-rows-[110px] gap-4"
            >
              {projects.map((project, index) => (
                <Card
                  key={index}
                  className="bg-transparent dark:hover:opacity-80 hover:brightness-90 dark:shadow-xs dark:shadow-zinc-950 border-zinc-300 border-b-zinc-400 dark:border-zinc-800 dark:border-b-zinc-700 flex flex-col justify-between hover:cursor-pointer"
                  onClick={() => router.push(`/projects/${project.id}`)}
                >
                  <div className="h-2 bg-red-500 w-3 rounded-xs m-3"></div>
                  <div className="h-[40%] bg-zinc-300 dark:bg-zinc-800 w-full rounded-b-sm p-2.5">
                    {project.title}
                  </div>
                </Card>

                // <div key={index} className="bg-gradient-to-b from-white-100/100 to-zinc-900/10 dark:from-cyan-950/100 dark:to-cyan-950/200 border-1 border-zinc-400/20 dark:border-cyan-950/40 rounded-md">{folder.title}</div>
                // <FolderCard key={index} title={folder.title} size="20" icon variant="high"></FolderCard>
              ))}
              <FormPopover side="right" align="center" sideOffset={10}>
              <Card className="flex flex-col h-full items-center justify-center text-sm bg-zinc-200 p-3 border-[1.7px] border-zinc-400/40 border-dashed dark:bg-zinc-800 dark:border-slate-500/40 hover:cursor-pointer">
                <Plus size={17} />
                Create new project
              </Card>
              </FormPopover>
              {/* <div className="bg-zinc-700 rounded-md">5</div>
              <div className="bg-zinc-700 rounded-md">5</div>
              <div className="bg-zinc-700 rounded-md">5</div>
              <div className="bg-zinc-700 rounded-md">5</div>
              <div className="bg-zinc-700 rounded-md">5</div> */}
            </div>
}
          </section>
        </section>
      </div>
    </Card>
  );
};

export default Page;
