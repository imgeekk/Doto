"use server";

import prisma from "@/app/lib/prisma";
import {
  Column,
  ColumnWithTasks,
  Project,
  Task,
  TaskWithColumn,
} from "../../config/model";

type TaskUpdate = Partial<Task>;

// ---Project Services---

async function getProjects(userId: string): Promise<Project[]> {
  try {
    const data = await prisma.projects.findMany({
      where: {
        userId: userId,
      },
      orderBy: {
        createdAt: "asc",
      },
    });
    return data || [];
  } catch (err) {
    throw err;
  }
}

async function getProject(projectId: string): Promise<Project | null> {
  try {
    const data = await prisma.projects.findUnique({
      where: {
        id: projectId,
      },
    });
    return data;
  } catch (err) {
    throw err;
  }
}

async function createProject(project: {
  title: string;
  description?: string;
  color?: string;
  userId: string;
}): Promise<Project> {
  try {
    const data = await prisma.projects.create({
      data: {
        title: project.title,
        description: project.description,
        color: project.color,
        userId: project.userId,
      },
    });
    return data;
  } catch (err) {
    throw err;
  }
}

async function updateProject(
  projectId: string,
  newTitle: string,
): Promise<Project> {
  try {
    const project = await prisma.projects.update({
      where: {
        id: projectId,
      },
      data: {
        title: newTitle,
      },
    });
    return project;
  } catch (err) {
    throw err;
  }
}

async function deleteProject(projectId: string, userId: string) {
  try {
    const data = await prisma.$transaction(async (tx) => {
      const project = await tx.projects.findUnique({
        where: {
          id: projectId,
        },
      });
      await tx.projects.delete({
        where: {
          id: projectId,
        },
      });

      await tx.activityLogs.create({
        data: {
          type: "PROJECT_DELETED",
          userId,
          message: `Project "${project?.title}" was deleted`,
        },
      });
    });
    return data;
  } catch (err) {
    throw err;
  }
}

// ---Column Services---

async function createColumn(column: {
  projectId: string;
  title: string;
  sortOrder: number;
}) {
  try {
    const data = await prisma.columns.create({
      data: {
        projectId: column.projectId,
        title: column.title,
        sortOrder: column.sortOrder,
      },
      include: {
        tasks: true,
      },
    });
    return data;
  } catch (err) {
    throw err;
  }
}

async function deleteColumn(columnId: string) {
  try {
    const data = await prisma.columns.delete({
      where: {
        id: columnId,
      },
    });
    return data;
  } catch (err) {
    throw err;
  }
}

async function updateColumn(
  columnId: string,
  newTitle: string,
): Promise<ColumnWithTasks> {
  try {
    const column = await prisma.columns.update({
      where: {
        id: columnId,
      },
      include: {
        tasks: true,
      },
      data: {
        title: newTitle,
      },
    });
    return column;
  } catch (err) {
    throw err;
  }
}

// async function getColumns(projectId: string): Promise<Column[]> {
//   try {
//     const data = await prisma.columns.findMany({
//       where: {
//         projectId: projectId,
//       },
//       orderBy: {
//         sortOrder: "asc",
//       },
//     });
//     return data || [];
//   } catch (err) {
//     throw err;
//   }
// }
async function getColumnsWithTasks(
  projectId: string,
): Promise<ColumnWithTasks[]> {
  try {
    const data = await prisma.columns.findMany({
      where: {
        projectId: projectId,
      },
      include: {
        tasks: {
          orderBy: {
            sortOrder: "asc",
          },
        },
      },
      orderBy: {
        sortOrder: "asc",
      },
    });
    return data || [];
  } catch (err) {
    throw err;
  }
}

async function reorderColumns(
  projectId: string,
  updates: { id: string; sortOrder: number }[],
) {
  try {
    // Create an array of update promises for the transaction
    const transaction = updates.map((update) =>
      prisma.columns.update({
        where: { id: update.id, projectId: projectId },
        data: { sortOrder: update.sortOrder },
      }),
    );
    // Execute all updates atomically
    await prisma.$transaction(transaction);
    return true;
  } catch (err) {
    throw err;
  }
}

// ---Tasks Service---

async function getTasksByProject(projectId: string): Promise<Task[]> {
  try {
    const data = await prisma.tasks.findMany({
      where: {
        column: {
          projectId: projectId,
        },
      },
      orderBy: {
        sortOrder: "asc",
      },
    });
    return data || [];
  } catch (err) {
    throw err;
  }
}

async function getTask(taskId: string): Promise<TaskWithColumn | null> {
  try {
    const data = await prisma.tasks.findUnique({
      where: {
        id: taskId,
      },
      include: {
        column: true,
      },
    });
    return data;
  } catch (err) {
    throw err;
  }
}

async function createTask(task: {
  title: string;
  columnId: string;
  sortOrder: number;
  projectId: string;
  userId: string;
}) {
  try {
    const data = await prisma.$transaction(async (tx) => {
      const createdTask = await tx.tasks.create({
        data: {
          title: task.title,
          columnId: task.columnId,
          sortOrder: task.sortOrder,
        },
      });

      await tx.activityLogs.create({
        data: {
          type: "TASK_CREATED",
          taskId: createdTask.id,
          projectId: task.projectId,
          userId: task.userId,
          message: `Task "${task.title}" was created`,
        },
      });

      return createdTask;
    });

    return data;
  } catch (err) {
    throw err;
  }
}

async function updateTask(taskId: string, data: TaskUpdate) {
  try {
    const updatedTask = await prisma.tasks.update({
      where: {
        id: taskId,
      },
      data: data,
    });
    return updatedTask;
  } catch (err) {
    throw err;
  }
}

async function deleteTask(taskId: string, projectId: string, userId: string) {
  try {
    const data = await prisma.$transaction(async (tx) => {
      const task = await tx.tasks.findUnique({
        where: {
          id: taskId,
        },
      });

      await tx.activityLogs.create({
        data: {
          type: "TASK_DELETED",
          taskId,
          projectId,
          userId,
          message: `Task "${task?.title}" was deleted`,
        },
      });

      await tx.tasks.delete({
        where: {
          id: taskId,
        },
      });
    });
    return data;
  } catch (err) {
    throw err;
  }
}

async function setComplete(
  taskId: string,
  completed: boolean,
  projectId: string,
  userId: string,
) {
  try {
    const data = await prisma.$transaction(async (tx) => {
      const task = await tx.tasks.update({
        where: {
          id: taskId,
        },
        data: {
          completed: completed,
        },
      });

      await tx.activityLogs.create({
        data: {
          type: completed ? "TASK_COMPLETED" : "TASK_REOPENED",
          taskId,
          projectId,
          userId,
          message: `Task "${task.title}" was ${completed ? "completed" : "reopened"}`,
        },
      });

      return task;
    });

    return data;
  } catch (err) {
    throw err;
  }
}

async function moveTaskToColumn(
  taskId: string,
  newColumnId: string,
  newOrder: number,
) {
  try {
    const data = await prisma.tasks.update({
      where: {
        id: taskId,
      },
      data: {
        columnId: newColumnId,
        sortOrder: newOrder,
      },
    });
    return data;
  } catch (err) {
    throw err;
  }
}

async function reorderTasks(
  taskUpdates: { id: string; columnId: string; sortOrder: number }[],
) {
  try {
    // Create an array of update promises for the transaction
    const transaction = taskUpdates.map((update) =>
      prisma.tasks.update({
        where: { id: update.id },
        data: {
          columnId: update.columnId,
          sortOrder: update.sortOrder,
        },
      }),
    );
    // Execute all updates atomically
    await prisma.$transaction(transaction);
    return true;
  } catch (err) {
    throw err;
  }
}

async function updateTaskTitle(newTitle: string, taskId: string) {
  try {
    const task = await prisma.tasks.update({
      where: {
        id: taskId,
      },
      data: {
        title: newTitle,
      },
    });
    return task;
  } catch (err) {
    throw err;
  }
}

// ---Project + Column Services---

async function createProjectWithDefaultColumn(projectData: {
  title: string;
  description?: string;
  color?: string;
  userId: string;
}) {
  try {
    const data = await prisma.$transaction(async (tx) => {
      const project = await createProject({
        title: projectData.title,
        description: projectData.description,
        color: projectData.color || "bg-blue-500",
        userId: projectData.userId,
      });

      const defaultColumns = [
        { title: "To Do", sortOrder: 0 },
        { title: "In Progress", sortOrder: 1 },
        { title: "Review", sortOrder: 3 },
        { title: "Done", sortOrder: 4 },
      ];

      await Promise.all(
        defaultColumns.map((column) =>
          createColumn({ ...column, projectId: project.id }),
        ),
      );

      await tx.activityLogs.create({
        data: {
          type: "PROJECT_CREATED",
          projectId: project.id,
          userId: projectData.userId,
          message: `Project "${project.title}" was created`,
        },
      });

      return project;
    });

    return data;
  } catch (err) {
    throw err;
  }
}

async function getProjectsWithColumns(projectId: string) {
  const [project, columnsWithTasks] = await Promise.all([
    getProject(projectId),
    getColumnsWithTasks(projectId),
  ]);

  if (!project) throw new Error("Project not found");

  const tasks = await getTasksByProject(projectId);

  return { project, columnsWithTasks };
}

// ---Dashboard Services---
async function getDashboardStats(userId: string, timezone: any) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const todayEnd = new Date();
  todayEnd.setHours(23, 59, 59, 999);

  const [
    projectCount,
    taskCount,
    completedTaskCount,
    dueTodayTasks,
    recentActivity,
  ] = await Promise.all([
    prisma.projects.count({
      where: {
        userId,
      },
    }),

    prisma.tasks.count({
      where: {
        column: {
          project: {
            userId,
          },
        },
      },
    }),

    prisma.tasks.count({
      where: {
        completed: true,
        column: {
          project: {
            userId,
          },
        },
      },
    }),

    prisma.tasks.findMany({
      where: {
        dueDate: today,
        column: {
          project: {
            userId,
          },
        },
      },
      include: {
        column: {
          include: {
            project: {
              select: {
                title: true,
              },
            },
          },
        },
      },
      orderBy: {
        column: {
          createdAt: "asc",
        },
      },
    }),

    prisma.activityLogs.findMany({
      where: {
        userId,
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 10,
      include: {
        project: true,
        task: true,
      },
    }),
  ]);
  return {
    projectCount,
    taskCount,
    completedTaskCount,
    dueTodayTasks,
    recentActivity,
  };
}

export {
  createProjectWithDefaultColumn,
  deleteProject,
  getProjects,
  getProjectsWithColumns,
  getTask,
  updateProject,
  createTask,
  deleteTask,
  updateColumn,
  createColumn,
  deleteColumn,
  setComplete,
  moveTaskToColumn,
  reorderColumns,
  reorderTasks,
  updateTaskTitle,
  updateTask,
  getDashboardStats,
};
