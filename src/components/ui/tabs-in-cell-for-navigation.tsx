import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PanelsTopLeft, Box, House } from "lucide-react";
import ProjectCard from "../ProjectCard";

function TabDemo() {
  return (
    <Tabs defaultValue="tab-1" className="w-full">
      <ScrollArea>
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
      <TabsContent value="tab-1">
        <div>
          <header className="flex justify-between items-center p-2 border-b-1">
            <h1>Active Projects</h1>
            <div>Sort</div>
          </header>
          <section className="p-2">
            <ProjectCard/>
          </section>
        </div>
      </TabsContent>
      <TabsContent value="tab-2">
         <div>
          <header className="flex justify-between items-center p-2 border-b-1">
            <h1>Closed Projects</h1>
            <div>Sort</div>
          </header>
          <section className="p-2">
            <ProjectCard/>
          </section>
        </div>
      </TabsContent>
      <TabsContent value="tab-3">
         <div>
          <header className="flex justify-between items-center p-2 border-b-1">
            <h1>All Projects</h1>
            <div>Sort</div>
          </header>
          <section className="p-2">
            <ProjectCard/>
          </section>
        </div>
      </TabsContent>
    </Tabs>
  );
}

export { TabDemo };