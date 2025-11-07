/**
 * Task Model
 * Represents a task item in the task tracker
 */
export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Task Status Enum
 * Defines the possible states of a task
 */
export enum TaskStatus {
  TODO = 'To Do',
  IN_PROGRESS = 'In Progress',
  DONE = 'Done'
}

/**
 * Helper function to create a new task
 */
export function createTask(title: string, description: string): Task {
  const now = new Date();
  return {
    id: generateId(),
    title,
    description,
    status: TaskStatus.TODO,
    createdAt: now,
    updatedAt: now
  };
}

/**
 * Generate a unique ID for tasks
 */
function generateId(): string {
  return `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}
