import { Component, OnInit, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  CdkDragDrop,
  moveItemInArray,
  transferArrayItem,
  CdkDropList,
  CdkDrag,
} from '@angular/cdk/drag-drop';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog } from '@angular/material/dialog';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import {
  TaskService,
  Task,
  TaskStatus,
} from '../../../../core/services/task.service';
import { CreateTaskDialogComponent } from './create-task-dialog/create-task-dialog.component';
import { TaskDetailsDialogComponent } from './task-details-dialog/task-details-dialog.component';

@Component({
  selector: 'app-task-board',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatChipsModule,
    MatTooltipModule,
    CdkDropList,
    CdkDrag,
  ],
  templateUrl: './task-board.component.html',
  styleUrls: ['./task-board.component.scss'],
})
export class TaskBoardComponent implements OnInit {
  @Input() projectId!: string;

  tasks: { [key in TaskStatus]: Task[] } = {
    [TaskStatus.TODO]: [],
    [TaskStatus.IN_PROGRESS]: [],
    [TaskStatus.DONE]: [],
  };

  TaskStatus = TaskStatus;
  loading = true;
  error: string | null = null;

  constructor(private taskService: TaskService, private dialog: MatDialog) {}

  ngOnInit(): void {
    this.loadTasks();
  }

  loadTasks(): void {
    this.taskService.findAll(this.projectId).subscribe({
      next: (tasks) => {
        this.tasks = {
          [TaskStatus.TODO]: tasks.filter((t) => t.status === TaskStatus.TODO),
          [TaskStatus.IN_PROGRESS]: tasks.filter(
            (t) => t.status === TaskStatus.IN_PROGRESS
          ),
          [TaskStatus.DONE]: tasks.filter((t) => t.status === TaskStatus.DONE),
        };
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load tasks';
        this.loading = false;
        console.error('Error loading tasks:', err);
      },
    });
  }

  openCreateTaskDialog(): void {
    const dialogRef = this.dialog.open(CreateTaskDialogComponent, {
      width: '600px',
      data: { projectId: this.projectId },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.loadTasks();
      }
    });
  }

  openTaskDetails(task: Task): void {
    const dialogRef = this.dialog.open(TaskDetailsDialogComponent, {
      width: '600px',
      data: { task },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.loadTasks();
      }
    });
  }

  onDrop(event: CdkDragDrop<Task[]>): void {
    if (event.previousContainer === event.container) {
      moveItemInArray(
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );
    } else {
      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );

      const task = event.container.data[event.currentIndex];
      const newStatus = this.getStatusFromContainerId(event.container.id);

      this.taskService.updateStatus(task._id, newStatus).subscribe({
        error: (err) => {
          console.error('Error updating task status:', err);
          this.loadTasks(); // Reload to revert changes
        },
      });
    }
  }

  private getStatusFromContainerId(containerId: string): TaskStatus {
    switch (containerId) {
      case 'todo':
        return TaskStatus.TODO;
      case 'in-progress':
        return TaskStatus.IN_PROGRESS;
      case 'done':
        return TaskStatus.DONE;
      default:
        return TaskStatus.TODO;
    }
  }

  getStatusColor(status: TaskStatus): string {
    switch (status) {
      case TaskStatus.TODO:
        return '#4facfe';
      case TaskStatus.IN_PROGRESS:
        return '#f59e0b';
      case TaskStatus.DONE:
        return '#10b981';
      default:
        return '#4facfe';
    }
  }
}
