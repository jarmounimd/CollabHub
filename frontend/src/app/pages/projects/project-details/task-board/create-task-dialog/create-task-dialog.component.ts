import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import {
  MatDialogRef,
  MAT_DIALOG_DATA,
  MatDialogModule,
} from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import {
  TaskService,
  TaskStatus,
} from '../../../../../core/services/task.service';

@Component({
  selector: 'app-create-task-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
  ],
  templateUrl: './create-task-dialog.component.html',
  styleUrls: ['./create-task-dialog.component.scss'],
})
export class CreateTaskDialogComponent {
  taskForm: FormGroup;
  TaskStatus = TaskStatus;
  loading = false;
  error: string | null = null;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<CreateTaskDialogComponent>,
    private taskService: TaskService,
    @Inject(MAT_DIALOG_DATA) public data: { projectId: string }
  ) {
    this.taskForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(3)]],
      description: [''],
      status: [TaskStatus.TODO],
      assignedTo: [''],
      dueDate: [null],
    });
  }

  onSubmit(): void {
    if (this.taskForm.valid) {
      this.loading = true;
      const taskData = {
        ...this.taskForm.value,
        projectId: this.data.projectId,
      };

      this.taskService.create(taskData).subscribe({
        next: () => {
          this.dialogRef.close(true);
        },
        error: (err) => {
          this.error = 'Failed to create task';
          this.loading = false;
          console.error('Error creating task:', err);
        },
      });
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}
