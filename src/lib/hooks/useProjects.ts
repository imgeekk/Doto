"use client";

import { authClient } from "@/app/lib/auth-client";
import { Column, ColumnWithTasks, Project, Task } from "@/config/model";
import {
  createProjectWithDefaultColumn,
  getProjects,
  getProjectsWithColumns,
  updateProject,
  updateTaskTitle,
  createTask,
  updateColumn,
  createColumn,
  setComplete,
  moveTaskToColumn,
  reorderTasks,
  reorderColumns,
  deleteProject,
  deleteColumn,
} from "@/app/actions/services";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { task } from "better-auth/react";

export function useProjects() {
  const queryClient = useQueryClient();
  const { data, isPending } = authClient.useSession();
  const userId = data?.user.id;

  const {
    data: projects,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["projects", userId],
    queryFn: () => getProjects(userId!),
    enabled: !!userId,
  });

  const createProject = useMutation({
    mutationFn: (projectData: {
      title: string;
      description?: string;
      color?: string;
    }) =>
      createProjectWithDefaultColumn({
        ...projectData,
        userId: userId!,
      }),

    onMutate: async (projectData) => {
      await queryClient.cancelQueries({
        queryKey: ["projects", userId],
      });

      const previousData = queryClient.getQueryData(["projects", userId]);

      const tempId = `temp-${Date.now()}`;
      const optimisticProject = {
        id: tempId,
        title: projectData.title,
        description: projectData.description || null,
        color: projectData.color || null,
        status: "active",
        userId: userId!,
        createdAt: new Date(),
        updatedAt: new Date(),
        isOptimistic: true,
      };

      queryClient.setQueryData(["projects", userId], (old: any) => {
        if (!old) return [optimisticProject]; // return new array if no previous projects

        return [...old, optimisticProject];
      });

      return { previousData, tempId };
    },

    onError: (_err, _vars, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(["projects", userId], context.previousData);
      }
    },

    onSuccess: (result, variables, context) => {
      queryClient.setQueryData(["projects", userId], (old: any) => {
        if (!old) return old;

        return old.map((proj: Project) =>
          proj.id === context?.tempId ? result : proj,
        );
      });
    },
  });

  const deleteProjectMutation = useMutation({
    mutationFn: (projectId: string) => deleteProject(projectId),

    onMutate: async (projectId) => {
      await queryClient.cancelQueries({
        queryKey: ["projects", userId],
      });

      const previousData = queryClient.getQueryData(["projects", userId]);

      queryClient.setQueryData(["projects", userId], (old: any) => {
        if (!old) return old;
        return old.filter((proj: Project) => proj.id !== projectId);
      });

      return { previousData };
    },

    onError: (_err, _vars, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(["projects", userId], context.previousData);
      }
    },
  });

  return {
    projects,
    isLoading,
    error,
    createProject: createProject.mutateAsync,
    deleteProject: deleteProjectMutation.mutateAsync,
  };
}

export function useProject(projectId: string) {
  const queryClient = useQueryClient();

  //fetch project

  const { data, isLoading, error } = useQuery({
    queryKey: ["project", projectId],
    queryFn: () => getProjectsWithColumns(projectId),
    enabled: !!projectId,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });

  const project = data?.project;
  const columns = data?.columnsWithTasks ?? [];

  //update project title

  const updateProjectTitle = useMutation({
    mutationFn: ({
      projectId,
      newTitle,
    }: {
      projectId: string;
      newTitle: string;
    }) => updateProject(projectId, newTitle),

    onMutate: async ({ projectId, newTitle }) => {
      await queryClient.cancelQueries({ queryKey: ["project", projectId] });

      const previousData = queryClient.getQueryData(["project", projectId]);

      queryClient.setQueryData(["project", projectId], (old: any) => {
        if (!old) return old;

        return {
          ...old,
          project: {
            ...old.project,
            title: newTitle,
          },
        };
      });
      return { previousData };
    },

    onError: (_err, _vars, context) => {
      queryClient.setQueryData(["project", projectId], context?.previousData);
    },

    onSuccess: (updatedProject) => {
      queryClient.setQueryData(["project", projectId], (old: any) => {
        if (!old) return old;

        return {
          ...old,
          project: updatedProject,
        };
      });
    },
  });

  // update column title

  const updateColumnTitle = useMutation({
    mutationFn: ({
      columnId,
      newTitle,
    }: {
      columnId: string;
      newTitle: string;
    }) => updateColumn(columnId, newTitle),

    onMutate: async ({ columnId, newTitle }) => {
      await queryClient.cancelQueries({ queryKey: ["project", projectId] });

      const previousData = queryClient.getQueryData(["project", projectId]);

      queryClient.setQueryData(["project", projectId], (old: any) => {
        if (!old) return old;

        return {
          columnsWithTasks: old.columnsWithTasks.map((col: ColumnWithTasks) =>
            col.id === columnId ? { ...col, title: newTitle } : col,
          ),
        };
      });
      return { previousData };
    },

    onError: (_err, _vars, context) => {
      queryClient.setQueryData(["project", projectId], context?.previousData);
    },
  });

  // update task title

  const updateTaskTitleMutation = useMutation({
    mutationFn: ({ newTitle, taskId }: { newTitle: string; taskId: string }) =>
      updateTaskTitle(newTitle, taskId),

    onMutate: async ({ newTitle, taskId }) => {
      await queryClient.cancelQueries({ queryKey: ["project", projectId] });

      const previousData = queryClient.getQueryData(["project", projectId]);

      queryClient.setQueryData(["project", projectId], (old: any) => {
        if (!old) return old;

        return {
          ...old,
          columnsWithTasks: old.columnsWithTasks.map(
            (col: ColumnWithTasks) => ({
              ...col,
              tasks: col.tasks.map((t) =>
                t.id === taskId ? { ...t, title: newTitle } : t,
              ),
            }),
          ),
        };
      });
      return { previousData };
    },

    onError: (_err, _vars, context) => {
      queryClient.setQueryData(["project", projectId], context?.previousData);
    },
  });

  //create task

  const createTaskMutation = useMutation({
    mutationFn: createTask,

    onMutate: async (newTask) => {
      await queryClient.cancelQueries({ queryKey: ["project", projectId] });

      const previousData = queryClient.getQueryData(["project", projectId]);

      const tempId = `temp-${Date.now()}`;

      queryClient.setQueryData(["project", projectId], (old: any) => {
        if (!old) return old;

        return {
          ...old,
          columnsWithTasks: old.columnsWithTasks.map((col: ColumnWithTasks) =>
            col.id === newTask.columnId
              ? { ...col, tasks: [...col.tasks, { ...newTask, id: tempId }] }
              : col,
          ),
        };
      });

      return { previousData };
    },

    onError: (_err, _vars, context) => {
      queryClient.setQueryData(["project", projectId], context?.previousData);
    },

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["project", projectId],
      });
    },
  });

  // create new column

  const createColumnMutation = useMutation({
    mutationFn: createColumn,

    onMutate: async (newColumn) => {
      await queryClient.cancelQueries({
        queryKey: ["project", projectId],
      });

      const previousData = queryClient.getQueryData(["project", projectId]);

      queryClient.setQueryData(["project", projectId], (old: any) => {
        if (!old) return old;

        return {
          ...old,
          columnsWithTasks: [
            ...old.columnsWithTasks,
            {
              id: "temp-column",
              title: newColumn.title,
              tasks: [],
            },
          ],
        };
      });

      return { previousData };
    },

    onError: (_err, _vars, context) => {
      queryClient.setQueryData(["project", projectId], context?.previousData);
    },

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["project", projectId],
      });
    },
  });

  // delete column

  const deleteColumnMutation = useMutation({
    mutationFn: (columnId: string) => deleteColumn(columnId),

    onMutate: async (columnId) => {
      await queryClient.cancelQueries({
        queryKey: ["project", projectId],
      });

      const previousData = queryClient.getQueryData(["project", projectId]);

      queryClient.setQueryData(["project", projectId], (old: any) => {
        if (!old) return old;

        return {
          ...old,
          columnsWithTasks: old.columnsWithTasks.filter(
            (col: ColumnWithTasks) => col.id !== columnId,
          ),
        };
      });
      return { previousData };
    },

    onError: (_err, _vars, context) => {
      queryClient.setQueryData(["project", projectId], context?.previousData);
    },
  });

  // move task

  const moveTaskMutation = useMutation({
    mutationFn: ({
      taskId,
      newColumnId,
      newOrder,
    }: {
      taskId: string;
      newColumnId: string;
      newOrder: number;
    }) => moveTaskToColumn(taskId, newColumnId, newOrder),

    onMutate: async ({ taskId, newColumnId, newOrder }) => {
      await queryClient.cancelQueries({ queryKey: ["project", projectId] });

      const previousData = queryClient.getQueryData(["project", projectId]);

      queryClient.setQueryData(["project", projectId], (old: any) => {
        if (!old) return old;

        const columns = structuredClone(old.columnsWithTasks);

        let movedTask;

        for (const col of columns) {
          const index = col.tasks.findIndex((t: Task) => t.id === taskId);
          if (index !== -1) {
            movedTask = col.tasks.splice(index, 1)[0];
            break;
          }
        }

        if (movedTask) {
          const target = columns.find(
            (c: ColumnWithTasks) => c.id === newColumnId,
          );
          target.tasks.splice(newOrder, 0, movedTask);
        }

        return { ...old, columnsWithTasks: columns };
      });

      return { previousData };
    },

    onError: (_err, _vars, context) => {
      queryClient.setQueryData(["project", projectId], context?.previousData);
    },

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["project", projectId] });
    },
  });

  // set complete

  const setCompleteMutation = useMutation({
    mutationFn: ({
      taskId,
      completed,
    }: {
      taskId: string;
      completed: boolean;
    }) => setComplete(taskId, completed),

    onMutate: async ({ taskId, completed }) => {
      await queryClient.cancelQueries({ queryKey: ["project", projectId] });

      const previousData = queryClient.getQueryData(["project", projectId]);

      queryClient.setQueryData(["project", projectId], (old: any) => {
        if (!old) return old;

        return {
          ...old,
          columnsWithTasks: old.columnsWithTasks.map(
            (col: ColumnWithTasks) => ({
              ...col,
              tasks: col.tasks.map((task) =>
                task.id === taskId ? { ...task, completed } : task,
              ),
            }),
          ),
        };
      });

      queryClient.setQueryData(["task", taskId], (old: any) => {
        if (!old) return old;

        return {
          ...old,
          completed,
        };
      });

      return { previousData };
    },

    onError: (_err, _vars, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(["project", projectId], context.previousData);
      }
    },
  });

  // const reorderTasksMutation = useMutation({
  //   mutationFn: reorderTasks,

  //   onMutate: async (taskUpdates) => {
  //     await queryClient.cancelQueries({ queryKey: ["project", projectId] });

  //     const previousData = queryClient.getQueryData<{
  //       project: Project;
  //       columnsWithTasks: ColumnWithTasks[];
  //     }>(["project", projectId]);

  //     if (!previousData) return;

  //     const oldColumns = structuredClone(previousData.columnsWithTasks);

  //     for (const update of taskUpdates) {
  //       let movedTask: Task | undefined;

  //       for (const col of oldColumns) {
  //         const idx = col.tasks.findIndex((t) => t.id === update.id);
  //         if (idx !== -1) {
  //           movedTask = col.tasks.splice(idx, 1)[0];
  //           break;
  //         }
  //       }

  //       if (movedTask) {
  //         const targetColumn = oldColumns.find(
  //           (col) => col.id === update.columnId,
  //         );
  //         if (targetColumn) {
  //           movedTask.sortOrder = update.sortOrder;
  //           movedTask.columnId = update.columnId;
  //           targetColumn.tasks.splice(update.sortOrder, 0, movedTask);
  //         }
  //       }
  //     }

  //     queryClient.setQueryData(["project", projectId], {
  //       ...previousData,
  //       columnsWithTasks: oldColumns,
  //     });

  //     return { previousData };
  //   },

  //   onError: (_err, variables, context) => {
  //     if (context?.previousData) {
  //       queryClient.setQueryData(["project", projectId], context.previousData);
  //     }
  //   },
  // });

  // const reorderColumnsMutation = useMutation({
  //   mutationFn: ({
  //     projectId,
  //     columnUpdates,
  //   }: {
  //     projectId: string;
  //     columnUpdates: { id: string; sortOrder: number }[];
  //   }) => reorderColumns(projectId, columnUpdates),

  //   onMutate: async ({ projectId, columnUpdates }) => {
  //     await queryClient.cancelQueries({ queryKey: ["project", projectId] });

  //     const previousData = queryClient.getQueryData(["project", projectId]);
  //     if (!previousData) return { previousData: undefined };

  //     queryClient.setQueryData(["project", projectId], (old: any) => {
  //       if (!old || !Array.isArray(old.columnsWithTasks)) return old;

  //       const updated = [...old.columnsWithTasks]
  //         .map((col) => {
  //           const u = columnUpdates.find((c) => c.id === col.id);
  //           return u ? { ...col, sortOrder: u.sortOrder } : col;
  //         })
  //         .sort((a, b) => a.sortOrder - b.sortOrder);

  //       return { ...old, columnsWithTasks: updated };
  //     });

  //     return { previousData };
  //   },

  //   onError: (err, variables, context) => {
  //     if (context?.previousData) {
  //       queryClient.setQueryData(
  //         ["project", variables.projectId],
  //         context.previousData,
  //       );
  //     }
  //   },
  // });

  return {
    project,
    columns,
    isLoading,
    error,
    updateProjectTitle: updateProjectTitle.mutate,
    updateColumnTitle: updateColumnTitle.mutate,
    updateTaskTitle: updateTaskTitleMutation.mutate,
    createTask: createTaskMutation.mutate,
    createColumn: createColumnMutation.mutate,
    deleteColumn: deleteColumnMutation.mutate,
    moveTask: moveTaskMutation.mutate,
    setTaskComplete: setCompleteMutation.mutate,
    // reorderTask: reorderTasksMutation.mutate,
    // reorderColumns: reorderColumnsMutation.mutate,
  };
}
