export interface Project{
    id: string;
    title: string | null;
    description: string | null;
    color: string | null;
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
    assignedTo: string | null;
    dueDate: string | null;
    priority: "low" | "medium" | "high";
    sortOrder: number;
    createdAt: Date;
    // updatedAt: string;
}