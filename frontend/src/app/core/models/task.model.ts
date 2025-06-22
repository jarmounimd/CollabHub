export enum TaskStatus {
  TODO = 'To Do',
  IN_PROGRESS = 'In Progress',
  DONE = 'Done',
}

export interface Task {
  _id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  assignedTo?: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  } | null;
  createdBy: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  projectId?: {
    _id: string;
    name: string;
    description?: string;
  } | null;
  dueDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateTaskDto {
  title: string;
  description: string;
  status: TaskStatus;
  projectId: string;
  assignedTo?: string;
  dueDate?: Date;
}

export interface UpdateTaskDto {
  title?: string;
  description?: string;
  status?: TaskStatus;
  assignedTo?: string;
  dueDate?: Date;
}
