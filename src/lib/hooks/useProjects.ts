"use client";

import { authClient } from "@/app/lib/auth-client";
import { Column, ColumnWithTasks, Project } from "@/config/model";
import {
  createProjectWithDefaultColumn,
  getProjects,
  getProjectsWithColumns,
  updateProject,
  createTask,
  updateColumn,
  createColumn,
  setComplete,
  moveTaskToColumn,
} from "@/app/actions/services";
import { useEffect, useState } from "react";

export function useProjects() {
  const { data, isPending } = authClient.useSession();
  const userId = data?.user.id;

  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (userId) {
      loadProjects();
    }
  }, [userId]);

  async function loadProjects() {
    if (!userId) return;

    try {
      setLoading(true);
      setError(null);
      const data = await getProjects(userId);
      setProjects(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load projects");
    } finally {
      setLoading(false);
    }
  }

  async function createProject(projectData: {
    title: string;
    description?: string;
    color?: string;
  }) {
    if (!userId) throw new Error("User not authenticated");

    try {
      const newProject = await createProjectWithDefaultColumn({
        ...projectData,
        userId,
      });
      setProjects((prev) => [
        ...prev,
        newProject
      ])
      return newProject.id
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "Failed to create project");
    }
  }

  return { createProject, projects, error, loading };
}

export function useProject(projectId: string) {
  const [project, setProject] = useState<Project | null>(null);
  const [columns, setColumns] = useState<ColumnWithTasks[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (projectId) {
      loadProject();
    }
  }, [projectId]);

  async function loadProject() {
    if (!projectId) return;

    try {
      setLoading(true);
      setError(null);
      const data = await getProjectsWithColumns(projectId);
      setProject(data.project);
      setColumns(data.columnsWithTasks);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load projects");
    } finally {
      setLoading(false);
    }
  }

  async function updateProjectTitle(projectId: string, newTitle: string) {
    try {
      const updatedProject = await updateProject(projectId, newTitle);
      setProject(updatedProject);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update project");
    }
  }

  async function updateColumnTitle(columnId: string, newTitle: string) {
    try {
        console.log('Pre-Update Column Titles:', columns.map(c => c.title));

        const updatedColumn = await updateColumn(columnId, newTitle);

        setColumns((prev) => {
            const newState = prev.map((col) => col.id === columnId ? {...col, title: newTitle} : col);
            console.log('Post-Update Column Titles (in setter):', newState.map(c => c.title));
            return newState;
        });
    } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to update project");
    }
}

  async function createRealTask(
    columnId: string,
    taskData: {
      title: string;
      description?: string;
      // assignee?: string;
      dueDate?: string;
      prority?: "low" | "medium" | "high";
    }
  ) {
    try {
      const newTask = await createTask({
        title: taskData.title,
        description: taskData.description || null,
        completed: false,
        dueDate: taskData.dueDate || null,
        columnId: columnId,
        sortOrder:
          columns.find((col) => col.id === columnId)?.tasks.length || 0,
        priority: taskData.prority || "medium",
      });

      setColumns((prev) =>
        prev.map((col) =>
          col.id === columnId ? { ...col, tasks: [...col.tasks, newTask] } : col
        )
      );

      return newTask
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create task");
    }
  }

  async function createNewColumn(title: string){
    if(!project) throw new Error("Board not loaded");
    try {
      const newColumn = await createColumn({title, projectId: project.id, sortOrder: columns.length})

      setColumns((prev) => [...prev, {...newColumn, tasks: []}]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create column")
    }
  }

  async function setTaskComplete(taskId: string, completed: boolean) {
    try {
      const updatedTask = await setComplete(taskId, completed)
      setColumns((prev) => prev.map((col) => {
        const taskIndex = col.tasks.findIndex((task) => task.id === taskId);

        if(taskIndex == -1){
          return col;
        }

        return {
          ...col,
          tasks: col.tasks.map((task) => task.id === taskId ? updatedTask : task)
        }
      }));
      return updatedTask;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update project");
    }
  }
  async function moveTask(taskId: string, newColumnId: string, newOrder: number){
    try {
      const data = await moveTaskToColumn(taskId, newColumnId, newOrder)

      setColumns((prev) => {
        const newColumns = [...prev];

        let taskToMove;
        for(const col of newColumns) {
          const taskIndex = col.tasks.findIndex((task) => task.id === taskId);
          if(taskIndex !== -1) {
            taskToMove = col.tasks[taskIndex];
            col.tasks.splice(taskIndex, 1);
            break;
          }
        }

        if(taskToMove) {
          const targetColumn = newColumns.find((col) => col.id === newColumnId)
          if(targetColumn){
            targetColumn.tasks.splice(newOrder, 0, taskToMove)
          }
        }
        return newColumns
      })
    } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to move task");
    }
  }


  return { project, columns, loading, error, updateProjectTitle, createRealTask, updateColumnTitle, setTaskComplete, setColumns, moveTask, createNewColumn};
}
