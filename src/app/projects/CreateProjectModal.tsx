import { Button } from "@/components/ui/button-1";
import { Dialog, DialogContent, DialogHeader } from "@/components/ui/dialog";
import useCreateProjectModal from "@/hooks/use-create-project-modal";
import useCardModal from "@/hooks/use-task-modal";
import { useProjects } from "@/lib/hooks/useProjects";

const CreateProjectModal = () => {

  const { createProject } = useProjects();
  const isOpen = useCreateProjectModal((state) => state.isOpen);
  const onClose = useCreateProjectModal((state) => state.onClose);

  const handleCreateProject = (formData: FormData) => {
    const title = formData.get("title") as string;
    const description = formData.get("description") as string;

    if (!title) return;

    createProject({title, description});

    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[95vw] max-w-[425px] mx-auto font-[monument] top-[35%]">
        <DialogHeader>
          <h1 className="text-xl font-[inter-bold] mb-4">Create New Project</h1>
        </DialogHeader>
        <form onSubmit={(e) => {
          e.preventDefault();
          const formData = new FormData(e.currentTarget);
          handleCreateProject(formData);
        }}>
          <input
            name="title"
            className="w-full p-2 border dark:border-white/10 border-black/10 rounded-[2px] mb-4 focus:outline-1 focus:outline-blue-500"
            placeholder="Project Name"
          ></input>
          <textarea
            name="description"
            className="resize-none w-full p-2 border dark:border-white/10 border-black/10 rounded-[2px] mb-4 focus:outline-1 focus:outline-blue-500"
            placeholder="Project Description"
          ></textarea>
          <div className="w-full flex justify-end">
            <Button className="rounded-[4px] bg-blue-400 hover:bg-blue-300">
              Create Project
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateProjectModal;
