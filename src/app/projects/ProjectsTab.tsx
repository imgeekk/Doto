import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PanelsTopLeft, Box, House, Plus } from "lucide-react";
import ProjectCard from "../../components/ProjectCard";
import { Project } from "@/config/model";
import { BsFilter } from "react-icons/bs";
import useCreateProjectModal from "@/hooks/use-create-project-modal";
import { useProjects } from "@/lib/hooks/useProjects";
import RippleWaveLoader from "@/components/ui/ripple-loader";

function ProjectsTabs({ userId }: { userId: string }) {
  const { createProject, projects, isLoading, error } = useProjects();

  const createProjectModal = useCreateProjectModal();
  function handleCreateNewColumn() {}

  if (error) {
    return (
      <div className="absolute inset-0 flex items-center justify-center">
        Error While Fetching Projects
      </div>
    );
  }

  if (isLoading || !projects) {
    return (
      <div className="absolute inset-0 flex items-center justify-center">
        <RippleWaveLoader className="h-6 w-2" />
      </div>
    );
  }

  if (projects.length === 0) {
    return (
      <div className="absolute inset-0 flex items-center justify-center">
        <p>No projects available</p>
        <button
          onClick={() => createProjectModal.onOpen()}
          className="flex items-center gap-1 text-sm text-primary mt-3"
        >
          <Plus size={16} />
          Create your first project
        </button>
      </div>
    );
  }

  const activeProjects = projects.filter((p) => p.status === "active");
  const closedProjects = projects.filter((p) => p.status === "closed");

  return (
    <Tabs defaultValue="tab-1" className="flex flex-col w-full h-full">
      <ScrollArea className="">
        <TabsList className="mb-3 h-auto -space-x-px bg-background p-0 shadow-sm shadow-black/5 rtl:space-x-reverse">
          <TabsTrigger
            value="tab-1"
            className="relative overflow-hidden rounded-none border border-border py-2 after:pointer-events-none after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 first:rounded-s last:rounded-e data-[state=active]:bg-muted data-[state=active]:after:bg-primary"
          >
            <PanelsTopLeft
              className="-ms-0.5 me-1.5 opacity-60"
              size={16}
              strokeWidth={2}
              aria-hidden="true"
            />
            Active
          </TabsTrigger>
          <TabsTrigger
            value="tab-2"
            className="relative overflow-hidden rounded-none border border-border py-2 after:pointer-events-none after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 first:rounded-s last:rounded-e data-[state=active]:bg-muted data-[state=active]:after:bg-primary"
          >
            <PanelsTopLeft
              className="-ms-0.5 me-1.5 opacity-60"
              size={16}
              strokeWidth={2}
              aria-hidden="true"
            />
            Closed
          </TabsTrigger>
          <TabsTrigger
            value="tab-3"
            className="relative overflow-hidden rounded-none border border-border py-2 after:pointer-events-none after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 first:rounded-s last:rounded-e data-[state=active]:bg-muted data-[state=active]:after:bg-primary"
          >
            <PanelsTopLeft
              className="-ms-0.5 me-1.5 opacity-60"
              size={16}
              strokeWidth={2}
              aria-hidden="true"
            />
            All Projects
          </TabsTrigger>
        </TabsList>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
      <TabsContent value="tab-1" className="flex-1 min-h-0">
        <div className="h-full flex flex-col">
          <header className="flex justify-between items-center p-2 border-b-1">
            <h1 className="font-[inter-bold]">Active Projects</h1>
            <div className="flex items-center gap-2">
              <button
                onClick={() => createProjectModal.onOpen()}
                className="hover:cursor-pointer"
              >
                <Plus size={20} />
              </button>
              <BsFilter size={16} />
            </div>
          </header>
          <section className="p-2 flex-1 min-h-0 overflow-y-auto">
            {activeProjects.length === 0 ? (
              <p>No active projects</p>
            ) : (
              activeProjects.map((project) => (
                <ProjectCard key={project.id} project={project} />
              ))
            )}
          </section>
        </div>
      </TabsContent>
      <TabsContent value="tab-2" className="flex-1 min-h-0">
        <div className="h-full flex flex-col">
          <header className="flex justify-between items-center p-2 border-b-1">
            <h1>Closed Projects</h1>
            <div>Sort</div>
          </header>
          <section className="p-2 flex-1 min-h-0 overflow-y-auto">
            {closedProjects.length === 0 ? (
              <p>
                No closed projects
              </p>
            ) : (
              closedProjects.map((project) => (
                <ProjectCard key={project.id} project={project} />
              ))
            )}
          </section>
        </div>
      </TabsContent>
      <TabsContent value="tab-3" className="flex-1 min-h-0">
        <div className="h-full flex flex-col">
          <header className="flex justify-between items-center p-2 border-b-1">
            <h1>All Projects</h1>
            <div>Sort</div>
          </header>
          <section className="p-2 flex-1 min-h-0 overflow-y-auto">
            {projects.length === 0 ? (
              <p>No projects</p>
            ) : (
              projects.map((project) => (
                <ProjectCard key={project.id} project={project} />
              ))
            )}
          </section>
        </div>
      </TabsContent>
    </Tabs>
  );
}

export { ProjectsTabs };
