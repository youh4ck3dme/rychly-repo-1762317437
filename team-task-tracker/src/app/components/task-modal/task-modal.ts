import { Component, EventEmitter, Input, Output, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Task, TaskStatus } from '../../models/task.model';

/**
 * Task Modal Component
 * Modal dialog for creating and editing tasks
 * Supports both add and edit modes
 */
@Component({
  selector: 'app-task-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './task-modal.html',
  styleUrls: ['./task-modal.css'],
})
export class TaskModalComponent implements OnInit {
  @Input() isOpen = false;
  @Input() task: Task | null = null; // If task is provided, it's edit mode
  @Output() close = new EventEmitter<void>();
  @Output() save = new EventEmitter<{ title: string; description: string; status?: TaskStatus }>();

  title = '';
  description = '';
  status: TaskStatus = TaskStatus.TODO;
  isEditMode = false;

  // Make TaskStatus enum available in template
  TaskStatus = TaskStatus;
  statusOptions = [TaskStatus.TODO, TaskStatus.IN_PROGRESS, TaskStatus.DONE];

  ngOnInit(): void {
    this.isEditMode = !!this.task;
    if (this.task) {
      this.title = this.task.title;
      this.description = this.task.description;
      this.status = this.task.status;
    }
  }

  /**
   * Handle form submission
   */
  onSubmit(): void {
    if (this.title.trim() && this.description.trim()) {
      this.save.emit({
        title: this.title.trim(),
        description: this.description.trim(),
        status: this.isEditMode ? this.status : undefined,
      });
      this.resetForm();
    }
  }

  /**
   * Handle modal close
   */
  onClose(): void {
    this.resetForm();
    this.close.emit();
  }

  /**
   * Handle backdrop click
   */
  onBackdropClick(event: MouseEvent): void {
    if (event.target === event.currentTarget) {
      this.onClose();
    }
  }

  /**
   * Reset form fields
   */
  private resetForm(): void {
    this.title = '';
    this.description = '';
    this.status = TaskStatus.TODO;
  }

  /**
   * Prevent event propagation
   */
  stopPropagation(event: Event): void {
    event.stopPropagation();
  }
}
