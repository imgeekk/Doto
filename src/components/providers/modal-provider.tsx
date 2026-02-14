"use client";

import TaskModal from "@/app/projects/[projectId]/components/TaskModal";
import CreateProjectModal from "@/app/projects/CreateProjectModal";
import { useEffect, useState } from "react";

const ModalProvider = () => {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return null;
  }
  return (
    <>
      <TaskModal />
      <CreateProjectModal />
    </>
  );
};

export default ModalProvider;
