"use client";

import { authClient } from "@/app/lib/auth-client";
import { ColumnWithTasks, Task } from "@/config/model";
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
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export function useProjects() {
  const queryClient = useQueryClient();
  const { data, isPending } = authClient.useSession();
  const userId = data?.user.id;

  const {
    data: projects = [],
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

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["projects", userId],
      });
    },
  });

  return {
    projects,
    isLoading,
    error,
    createProject: createProject.mutateAsync,
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

    onMutate: async({projectId, newTitle}) => {
      await queryClient.cancelQueries({queryKey: ["project", projectId]});

      const previousData = queryClient.getQueryData(["project", projectId]);

      queryClient.setQueryData(["project", projectId], (old: any) => {
        if(!old) return old;

        return {
          ...old,
          project: {
            ...old.project,
            title: newTitle,
          }
        };
      });
      return {previousData};
    },

    onError: (_err, _vars, context) => {
      queryClient.setQueryData(
        ["project", projectId],
        context?.previousData
      )
    },

    onSuccess: (updatedProject) => {
      queryClient.setQueryData(
        ["project", projectId],
        (old: any) => {
          if(!old) return old;

          return {
            ...old,
            project: updatedProject,
          }
        }
      )
    }
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

   onMutate: async({columnId, newTitle}) => {
      await queryClient.cancelQueries({queryKey: ["project", projectId]});

      const previousData = queryClient.getQueryData(["project", projectId]);

      queryClient.setQueryData(["project", projectId], (old: any) => {
        if(!old) return old;

        return {
          columnsWithTasks: old.columnsWithTasks.map((col: ColumnWithTasks) =>
            col.id === columnId
              ? { ...col, title: newTitle }
              : col,
          ),
        };
      });
      return {previousData};
    },

    onError: (_err, _vars, context) => {
      queryClient.setQueryData(
        ["project", projectId],
        context?.previousData
      )
    },

  });

  //create task

  const createTaskMutation = useMutation({
    mutationFn: createTask,

    onMutate: async (newTask) => {
      await queryClient.cancelQueries({ queryKey: ["project", projectId] });

      const previousData = queryClient.getQueryData(["project", projectId]);

      queryClient.setQueryData(["project", projectId], (old: any) => {
        if (!old) return old;

        return {
          ...old,
          columnsWithTasks: old.columnsWithTasks.map((col: ColumnWithTasks) =>
            col.id === newTask.columnId
              ? { ...col, tasks: [...col.tasks, newTask] }
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

        const copy = structuredClone(old);

        for (const col of copy.columnsWithTasks) {
          const task = col.tasks.find((t: Task) => t.id === taskId);
          if (task) {
            task.completed = completed;
            break;
          }
        }
        return copy;
      });

      return { previousData };
    },

    onError: (_err, _vars, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(["project", projectId], context.previousData);
      }
    },
  });

  return {
    project,
    columns,
    isLoading,
    error,
    updateProjectTitle: updateProjectTitle.mutate,
    updateColumnTitle: updateColumnTitle.mutate,
    createTask: createTaskMutation.mutate,
    moveTask: moveTaskMutation.mutate,
    setTaskComplete: setCompleteMutation.mutate,
  };
}
