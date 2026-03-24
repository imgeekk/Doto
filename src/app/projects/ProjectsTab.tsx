import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus } from "lucide-react";
import ProjectCard from "../../components/ProjectCard";
import { BsFilter } from "react-icons/bs";
import useCreateProjectModal from "@/hooks/use-create-project-modal";
import { useProjects } from "@/lib/hooks/useProjects";

function ProjectsTabs({ userId }: { userId: string }) {
  const { createProject, deleteProject, projects, isLoading, error } =
    useProjects();
  const createProjectModal = useCreateProjectModal();

  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p className="text-sm text-black/50 dark:text-white/50">
          Couldn't fetch your projects.
        </p>
      </div>
    );
  }

  if (projects?.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-3">
        <p className="text-black/50 dark:text-white/50 text-sm">No projects yet</p>
        <button
          onClick={() => createProjectModal.onOpen()}
          className="flex items-center gap-1 text-xs text-white dark:text-black bg-blue-500 px-2.5 py-1.5 rounded-full hover:cursor-pointer hover:bg-blue-600 transition-colors"
        >
          <Plus size={13} />
          Create your first project
        </button>
      </div>
    );
  }

  const activeProjects = projects?.filter((p) => p.status === "active") ?? [];
  const closedProjects = projects?.filter((p) => p.status === "closed") ?? [];

  return (
    <Tabs defaultValue="tab-1" className="flex flex-col w-full h-full pb-5">
      {/* Pill-style tab triggers — matches skeleton's rounded-full tab boxes */}
      <ScrollArea>
        <TabsList className="mb-3 h-auto bg-transparent p-0 gap-2 flex justify-start">
          <TabsTrigger
            value="tab-1"
            className="text-xs px-3 py-1 rounded-[4px] border border-black/10 dark:border-white/10 bg-transparent data-[state=active]:bg-blue-500 data-[state=active]:text-white dark:data-[state=active]:bg-blue-500 dark:data-[state=active]:text-black transition-colors"
          >
            Active
          </TabsTrigger>
          <TabsTrigger
            value="tab-2"
            className="text-xs px-3 py-1 rounded-[4px] border border-black/10 dark:border-white/10 bg-transparent data-[state=active]:bg-blue-500 data-[state=active]:text-white dark:data-[state=active]:bg-blue-500 dark:data-[state=active]:text-black transition-colors"
          >
            Closed
          </TabsTrigger>
          <TabsTrigger
            value="tab-3"
            className="text-xs px-3 py-1 rounded-[4px] border border-black/10 dark:border-white/10 bg-transparent data-[state=active]:bg-blue-500 data-[state=active]:text-white dark:data-[state=active]:bg-blue-500 dark:data-[state=active]:text-black transition-colors"
          >
            All
          </TabsTrigger>
        </TabsList>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>

      <TabsContent value="tab-1" className="flex-1 min-h-0">
        <div className="h-full flex flex-col">
          <header className="flex justify-between items-center pb-2 mb-2 border-b border-black/5 dark:border-white/10">
            <h1 className="text-xs font-medium text-black/50 dark:text-white/50">
              Active Projects
            </h1>
            <div className="flex items-center gap-2">
              <button
                onClick={() => createProjectModal.onOpen()}
                className="hover:cursor-pointer text-black/60 dark:text-white/60 hover:text-black dark:hover:text-white transition-colors"
              >
                <Plus size={16} />
              </button>
              <BsFilter size={15} className="text-black/60 dark:text-white/60" />
            </div>
          </header>
          <section className="flex-1 min-h-0 overflow-y-auto">
            {activeProjects.length === 0 ? (
              <p className="text-sm text-black/40 dark:text-white/40 p-2">No active projects</p>
            ) : (
              activeProjects.map((project) => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  deleteProject={deleteProject}
                />
              ))
            )}
          </section>
        </div>
      </TabsContent>

      <TabsContent value="tab-2" className="flex-1 min-h-0">
        <div className="h-full flex flex-col">
          <header className="flex justify-between items-center pb-2 mb-2 border-b border-black/5 dark:border-white/10">
            <h1 className="text-xs font-medium text-black/50 dark:text-white/50">
              Closed Projects
            </h1>
          </header>
          <section className="flex-1 min-h-0 overflow-y-auto">
            {closedProjects.length === 0 ? (
              <p className="text-sm text-black/40 dark:text-white/40 p-2">No closed projects</p>
            ) : (
              closedProjects.map((project) => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  deleteProject={deleteProject}
                />
              ))
            )}
          </section>
        </div>
      </TabsContent>

      <TabsContent value="tab-3" className="flex-1 min-h-0">
        <div className="h-full flex flex-col">
          <header className="flex justify-between items-center pb-2 mb-2 border-b border-black/5 dark:border-white/10">
            <h1 className="text-xs font-medium text-black/50 dark:text-white/50">
              All Projects
            </h1>
            <div className="flex items-center gap-2">
              <button
                onClick={() => createProjectModal.onOpen()}
                className="hover:cursor-pointer text-black/60 dark:text-white/60 hover:text-black dark:hover:text-white transition-colors"
              >
                <Plus size={16} />
              </button>
              <BsFilter size={15} className="text-black/60 dark:text-white/60" />
            </div>
          </header>
          <section className="flex-1 min-h-0 overflow-y-auto">
            {projects?.length === 0 ? (
              <p className="text-sm text-black/40 dark:text-white/40 p-2">No projects</p>
            ) : (
              projects?.map((project) => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  deleteProject={deleteProject}
                />
              ))
            )}
          </section>
        </div>
      </TabsContent>
    </Tabs>
  );
}

export { ProjectsTabs };