import { Project } from "@/config/model";
import { Card } from "./ui/card";
import { Button } from "./ui/button-1";
import { Edit } from "lucide-react";
import {
  Dropdown,
  DropdownTrigger,
  DropdownContent,
  DropdownItem,
  DropdownSeparator,
} from "./basic-dropdown";
import { MdDeleteOutline } from "react-icons/md";
import { BiWindowClose } from "react-icons/bi";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

const FolderIcon = ({ color = "var(--color)" }: { color?: string }) => (
  <svg
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="20"
    className="flex-shrink-0 [--color:#676767] dark:[--color:#B5B5B5]"
  >
    <path
      fill={color}
      d="M10 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z"
    />
  </svg>
);

const StatusBadge = ({ status }: { status: string }) => {
  if (status === "active") {
    return (
      <span className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-green-100 dark:bg-green-500/15 text-green-700 dark:text-green-400 font-medium whitespace-nowrap">
        <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
        Active
      </span>
    );
  }
  return (
    <span className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-white/10 text-zinc-500 dark:text-white/50 font-medium whitespace-nowrap">
      <span className="h-1.5 w-1.5 rounded-full bg-zinc-400" />
      Closed
    </span>
  );
};

const ProjectCard = ({
  project,
  deleteProject,
}: {
  project: Project & { isOptimistic?: boolean };
  deleteProject: (id: string) => void;
}) => {
  const router = useRouter();
  const MotionDiv = motion.div;

  if (project.isOptimistic) {
    return (
      <MotionDiv
        initial={{ opacity: 0.4 }}
        animate={{ opacity: [0.4, 0.8, 0.4] }}
        transition={{ duration: 0.6, ease: "easeInOut", repeat: Infinity }}
        className="flex items-center gap-3 p-2 mb-2 rounded-sm dark:bg-white/5 bg-zinc-50 border border-black/5 dark:border-white/10 cursor-not-allowed"
      >
        <FolderIcon />
        <div className="flex-1 flex flex-col gap-1">
          <p className="text-sm font-medium text-black/90 dark:text-white/90 truncate">
            {project.title}
          </p>
          <p className="text-xs text-black/40 dark:text-white/40 truncate">
            {project.createdAt.toString()}
          </p>
        </div>
        <StatusBadge status={project.status} />
        <Button variant="ghost" size="sm" className="opacity-40 cursor-not-allowed">
          <Edit size={16} />
        </Button>
      </MotionDiv>
    );
  }

  return (
    <div className="flex items-center gap-3 p-2 mb-2 rounded-sm dark:bg-white/5 bg-zinc-50 border border-black/5 dark:border-white/10">
      <FolderIcon />
      <div
        onClick={() => router.push(`/projects/${project.id}`)}
        className="flex-1 flex flex-col gap-1 cursor-pointer min-w-0"
      >
        <p className="text-sm font-medium text-black/90 dark:text-white/90 truncate">
          {project.title}
        </p>
        <p className="text-xs text-black/40 dark:text-white/40 truncate">
          {project.description || project.createdAt.toString()}
        </p>
      </div>
      <StatusBadge status={project.status} />
      <Dropdown>
        <DropdownTrigger className="cursor-pointer">
          <Button variant="ghost" size="sm">
            <Edit size={16} />
          </Button>
        </DropdownTrigger>
        <DropdownContent align="end" className="w-56">
          <DropdownItem
            className="gap-2"
            onClick={() => router.push("/new-project")}
          >
            <BiWindowClose className="h-5 w-5" />
            Close Project
          </DropdownItem>
          <DropdownSeparator />
          <DropdownItem
            className="gap-2"
            destructive
            onClick={() => deleteProject(project.id)}
          >
            <MdDeleteOutline className="h-5 w-5" />
            Delete
          </DropdownItem>
        </DropdownContent>
      </Dropdown>
    </div>
  );
};

export default ProjectCard;