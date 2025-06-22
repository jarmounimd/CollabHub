import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatNativeDateModule } from '@angular/material/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { TaskService } from '../../core/services/task.service';
import { AuthService } from '../../core/services/auth.service';
import { Task, TaskStatus } from '../../core/models/task.model';
import { TaskDetailsDialogComponent } from './task-details-dialog/task-details-dialog.component';
import { CreateTaskDialogComponent } from './create-task-dialog/create-task-dialog.component';

@Component({
  selector: 'app-tasks',
  templateUrl: './tasks.component.html',
  styleUrls: ['./tasks.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatDialogModule,
    MatNativeDateModule,
  ],
  providers: [MatNativeDateModule],
})
export class TasksComponent implements OnInit, OnDestroy {
  tasks: Task[] = [];
  loading = true;
  error: string | null = null;
  private destroy$ = new Subject<void>();

  constructor(
    private taskService: TaskService,
    private authService: AuthService,
    private router: Router,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.loadAccessibleTasks();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadAccessibleTasks(): void {
    this.loading = true;
    this.error = null;

    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/login']);
      return;
    }

    this.taskService
      .findUserAccessibleTasks()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (tasks) => {
          this.tasks = tasks; // <--- This must be set!
          console.log('Loaded tasks:', this.tasks);
          this.loading = false;
        },
        error: (error) => {
          this.error = error.message || 'Failed to load tasks';
          this.loading = false;
          if (error.message === 'No authenticated user found') {
            this.router.navigate(['/login']);
          }
        },
      });
  }

  getAssigneeName(task: Task): string {
    if (!task.assignedTo) return 'Unassigned';
    return (
      `${task.assignedTo.firstName || ''} ${
        task.assignedTo.lastName || ''
      }`.trim() || 'Unassigned'
    );
  }

  getProjectName(task: Task): string {
    return task.projectId?.name || 'No Project';
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
        return '#6b7280';
    }
  }

  isOverdue(date: Date): boolean {
    return new Date(date) < new Date();
  }

  openCreateTaskDialog(): void {
    const dialogRef = this.dialog.open(CreateTaskDialogComponent, {
      panelClass: 'custom-dialog-container',
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.loadAccessibleTasks(); // Refresh tasks if a new one was created
      }
    });
  }

  openTaskDetailsDialog(task: any) {
    this.dialog.open(TaskDetailsDialogComponent, {
      data: {
        ...task,
        statusColor: this.getStatusColor(task.status),
        projectName: this.getProjectName(task),
        assigneeName: this.getAssigneeName(task),
        createdByName:
          task.createdBy?.firstName + ' ' + task.createdBy?.lastName,
      },
      panelClass: 'custom-dialog-container',
    });
  }
}
