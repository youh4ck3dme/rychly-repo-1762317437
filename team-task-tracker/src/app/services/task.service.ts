import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Task, TaskStatus, createTask } from '../models/task.model';

/**
 * Task Service
 * Manages task data with localStorage persistence
 * Provides reactive state management using RxJS
 */
@Injectable({
  providedIn: 'root',
})
export class TaskService {
  private readonly STORAGE_KEY = 'team-task-tracker-tasks';
  private tasksSubject: BehaviorSubject<Task[]>;
  public tasks$: Observable<Task[]>;

  constructor() {
    // Load tasks from localStorage on initialization
    const storedTasks = this.loadTasksFromStorage();
    this.tasksSubject = new BehaviorSubject<Task[]>(storedTasks);
    this.tasks$ = this.tasksSubject.asObservable();
  }

  /**
   * Get all tasks
   */
  getTasks(): Task[] {
    return this.tasksSubject.value;
  }

  /**
   * Get a single task by ID
   */
  getTaskById(id: string): Task | undefined {
    return this.tasksSubject.value.find((task) => task.id === id);
  }

  /**
   * Add a new task
   */
  addTask(title: string, description: string): void {
    const newTask = createTask(title, description);
    const currentTasks = this.tasksSubject.value;
    const updatedTasks = [newTask, ...currentTasks];
    this.updateTasks(updatedTasks);
  }

  /**
   * Update an existing task
   */
  updateTask(id: string, updates: Partial<Omit<Task, 'id' | 'createdAt'>>): void {
    const currentTasks = this.tasksSubject.value;
    const taskIndex = currentTasks.findIndex((task) => task.id === id);

    if (taskIndex !== -1) {
      const updatedTask = {
        ...currentTasks[taskIndex],
        ...updates,
        updatedAt: new Date(),
      };
      const updatedTasks = [...currentTasks];
      updatedTasks[taskIndex] = updatedTask;
      this.updateTasks(updatedTasks);
    }
  }

  /**
   * Delete a task
   */
  deleteTask(id: string): void {
    const currentTasks = this.tasksSubject.value;
    const updatedTasks = currentTasks.filter((task) => task.id !== id);
    this.updateTasks(updatedTasks);
  }

  /**
   * Get tasks filtered by status
   */
  getTasksByStatus(status: TaskStatus): Task[] {
    return this.tasksSubject.value.filter((task) => task.status === status);
  }

  /**
   * Update tasks and persist to localStorage
   */
  private updateTasks(tasks: Task[]): void {
    this.tasksSubject.next(tasks);
    this.saveTasksToStorage(tasks);
  }

  /**
   * Load tasks from localStorage
   */
  private loadTasksFromStorage(): Task[] {
    try {
      const storedData = localStorage.getItem(this.STORAGE_KEY);
      if (storedData) {
        const tasks = JSON.parse(storedData);
        // Convert date strings back to Date objects
        return tasks.map((task: any) => ({
          ...task,
          createdAt: new Date(task.createdAt),
          updatedAt: new Date(task.updatedAt),
        }));
      }
    } catch (error) {
      console.error('Error loading tasks from localStorage:', error);
    }
    return [];
  }

  /**
   * Save tasks to localStorage
   */
  private saveTasksToStorage(tasks: Task[]): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(tasks));
    } catch (error) {
      console.error('Error saving tasks to localStorage:', error);
    }
  }

  /**
   * Clear all tasks (for testing purposes)
   */
  clearAllTasks(): void {
    this.updateTasks([]);
  }
}
