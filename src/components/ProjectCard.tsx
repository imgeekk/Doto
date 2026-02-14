import { Project } from "@/config/model";
import { Card } from "./ui/card";
import { Button } from "./ui/button-1";
import { Delete, Edit, User } from "lucide-react";
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

const ProjectCard = ({
  project,
}: {
  project: Project & { isOptimistic?: boolean };
}) => {
  const router = useRouter();
  const MotionCard = motion.create(Card);

  if (project.isOptimistic) {
    return (
      <MotionCard
        initial={{ opacity: 0.4 }}
        animate={{
          opacity: [0.4, 0.8, 0.4],
        }}
        transition={{
          duration: 0.6,
          ease: "easeInOut",
          repeat: Infinity,
        }}
        className="flex p-2 border-1 mb-5 rounded-[4px]"
      >
        <div className="flex-1 hover:cursor-not-allowed">
          <h1 className="sm:text-xl mb-1">{project.title}</h1>
          <p className="opacity-60">{project.description}</p>
          <p className="text-xs opacity-60">{project.createdAt.toString()}</p>
        </div>
        <div className="flex gap-3 items-center justify-center ml-3">
          {project.status === "active" ? (
            <div className="flex items-center justify-center gap-1 text-xs sm:text-sm">
              <div className="h-2 w-2 rounded-full bg-green-500"></div>
              Active
            </div>
          ) : (
            <div>Closed</div>
          )}

          <Button variant="ghost" size="sm">
            <Edit size={30} />
          </Button>
        </div>
      </MotionCard>
    );
  }
  return (
    <Card className="flex p-2 border-1 mb-5 rounded-[4px]">
      <div
        onClick={() => {
          if (project.isOptimistic) return;
          router.push(`/projects/${project.id}`);
        }}
        className="flex-1 hover:cursor-pointer"
      >
        <h1 className="sm:text-xl mb-1">{project.title}</h1>
        <p className="opacity-60">{project.description}</p>
        <p className="text-xs opacity-60">{project.createdAt.toString()}</p>
      </div>
      <div className="flex gap-3 items-center justify-center ml-3">
        {project.status === "active" ? (
          <div className="flex items-center justify-center gap-1 text-xs sm:text-sm">
            <div className="h-2 w-2 rounded-full bg-green-500"></div>
            Active
          </div>
        ) : (
          <div>Closed</div>
        )}
        <Dropdown>
          <DropdownTrigger className="cursor-pointer">
            <Button variant="ghost" size="sm">
              <Edit size={30} />
            </Button>
          </DropdownTrigger>
          <DropdownContent align="end" className="w-56">
            <DropdownItem
              className="gap-2"
              onClick={() => router.push("/new-project")}
            >
              <BiWindowClose className="h-5 w-5 " />
              Close Project
            </DropdownItem>
            <DropdownSeparator />
            <DropdownItem className="gap-2" destructive>
              <MdDeleteOutline className="h-5 w-5" />
              <p className="">Delete</p>
            </DropdownItem>
          </DropdownContent>
        </Dropdown>
      </div>
    </Card>
  );
};

export default ProjectCard;
