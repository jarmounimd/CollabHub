import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TaskService } from '../../../core/services/task.service';
import { User } from '../../../core/models/user.model';
import { ProjectService } from '../../../core/services/project.service';
import { GroupService } from '../../../core/services/group.service';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import {
  MAT_DATE_LOCALE,
  DateAdapter,
  MAT_DATE_FORMATS,
  MatNativeDateModule,
} from '@angular/material/core';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Project } from '../../../core/services/project.service';

@Component({
  selector: 'app-create-task-dialog',
  templateUrl: './create-task-dialog.component.html',
  styleUrls: ['./create-task-dialog.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatSelectModule,
    MatOptionModule,
    MatDatepickerModule,
    MatNativeDateModule,
    ReactiveFormsModule,
  ],
  providers: [MatNativeDateModule],
})
export class CreateTaskDialogComponent implements OnInit {
  form!: FormGroup;
  projects: Project[] = [];
  members: User[] = [];
  loading = false;

  constructor(
    private fb: FormBuilder,
    private projectService: ProjectService,
    private groupService: GroupService,
    private taskService: TaskService,
    public dialogRef: MatDialogRef<CreateTaskDialogComponent>
  ) {}

  ngOnInit() {
    this.form = this.fb.group({
      title: ['', Validators.required],
      description: [''],
      projectId: ['', Validators.required],
      assignedTo: [''],
      dueDate: [''],
      status: ['To Do'],
    });

    this.projectService.getProjects().subscribe((projects) => {
      this.projects = projects;
      console.log('Projects:', this.projects);
    });

    this.form.get('projectId')?.valueChanges.subscribe((projectId) => {
      const project = this.projects.find((p) => p._id === projectId);
      if (project?.groupId && project.groupId._id) {
        this.groupService
          .getGroupMembers(project.groupId._id)
          .subscribe((members) => {
            this.members = members; // <-- assign array directly
            this.form.get('assignedTo')!.setValue(null);
          });
      } else {
        this.members = [];
        this.form.get('assignedTo')!.setValue(null);
      }
    });
  }

  submit() {
    if (this.form.invalid) return;
    this.loading = true;

    // Prepare payload
    const payload = { ...this.form.value };
    if (payload.dueDate) {
      payload.dueDate = new Date(payload.dueDate).toISOString();
    }

    this.taskService.create(payload).subscribe({
      next: (task) => {
        this.loading = false;
        this.dialogRef.close(task);
      },
      error: () => (this.loading = false),
    });
  }

  close() {
    this.dialogRef.close();
  }
}
