export interface Project{
    id: string;
    title: string | null;
    description: string | null;
    color: string | null;
    status: "active" | "completed" | "closed";
    userId: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface Column{
    id: string;
    projectId: string;
    title: string;
    sortOrder: number;
    createdAt: Date;
}

export type ColumnWithTasks = Column & {
    tasks: Task[]
}

export interface Task{
    id: string;
    columnId: string;
    title: string;
    description: string | null;
    completed: boolean,
    coverColor: string | null;
    dueDate: Date | null;
    priority: "low" | "medium" | "high";
    sortOrder: number;
    createdAt: Date;
    // updatedAt: string;
}

export type TaskWithColumn = Task & {
    column: Column
}