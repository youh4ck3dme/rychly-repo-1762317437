import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { TaskService } from './services/task.service';
import { Task, TaskStatus } from './models/task.model';
import { TaskModalComponent } from './components/task-modal/task-modal';

/**
 * App Root Component
 * Main application component managing the task list and modal interactions
 */
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, TaskModalComponent],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App implements OnInit, OnDestroy {
  tasks: Task[] = [];
  isModalOpen = false;
  selectedTask: Task | null = null;

  // Make TaskStatus enum available in template
  TaskStatus = TaskStatus;

  private destroy$ = new Subject<void>();

  constructor(private taskService: TaskService) {}

  ngOnInit(): void {
    // Subscribe to tasks updates
    this.taskService.tasks$.pipe(takeUntil(this.destroy$)).subscribe((tasks) => {
      this.tasks = tasks;
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Open modal for adding a new task
   */
  openAddTaskModal(): void {
    this.selectedTask = null;
    this.isModalOpen = true;
  }

  /**
   * Open modal for editing an existing task
   */
  openEditTaskModal(task: Task): void {
    this.selectedTask = task;
    this.isModalOpen = true;
  }

  /**
   * Close the modal
   */
  closeModal(): void {
    this.isModalOpen = false;
    this.selectedTask = null;
  }

  /**
   * Handle task save from modal
   */
  onSaveTask(data: { title: string; description: string; status?: TaskStatus }): void {
    if (this.selectedTask) {
      // Update existing task
      this.taskService.updateTask(this.selectedTask.id, {
        title: data.title,
        description: data.description,
        status: data.status || this.selectedTask.status,
      });
    } else {
      // Add new task
      this.taskService.addTask(data.title, data.description);
    }
    this.closeModal();
  }

  /**
   * Delete a task
   */
  deleteTask(event: Event, taskId: string): void {
    event.stopPropagation();
    if (confirm('Are you sure you want to delete this task?')) {
      this.taskService.deleteTask(taskId);
    }
  }

  /**
   * Get status badge class
   */
  getStatusClass(status: TaskStatus): string {
    switch (status) {
      case TaskStatus.TODO:
        return 'status-todo';
      case TaskStatus.IN_PROGRESS:
        return 'status-in-progress';
      case TaskStatus.DONE:
        return 'status-done';
      default:
        return '';
    }
  }

  /**
   * Get task count by status
   */
  getTaskCountByStatus(status: TaskStatus): number {
    return this.tasks.filter((task) => task.status === status).length;
  }
}
