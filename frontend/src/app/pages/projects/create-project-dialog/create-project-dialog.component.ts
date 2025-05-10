import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import {
  MatDialogModule,
  MatDialogRef,
  MAT_DIALOG_DATA,
} from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar } from '@angular/material/snack-bar';
import {
  ProjectService,
  Project,
  CreateProjectDto,
  UpdateProjectDto,
} from '../../../core/services/project.service';
import { GroupService, Group } from '../../../core/services/group.service';

interface DialogData {
  project?: Project;
  isEdit?: boolean;
}

@Component({
  selector: 'app-create-project-dialog',
  templateUrl: './create-project-dialog.component.html',
  styleUrls: ['./create-project-dialog.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSelectModule,
  ],
})
export class CreateProjectDialogComponent implements OnInit {
  projectForm: FormGroup;
  groups: Group[] = [];
  isLoading = false;
  error: string | null = null;
  isEditMode = false;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<CreateProjectDialogComponent>,
    private projectService: ProjectService,
    private groupService: GroupService,
    private snackBar: MatSnackBar,
    @Inject(MAT_DIALOG_DATA) public data: DialogData
  ) {
    this.isEditMode = data?.isEdit || false;
    this.projectForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      description: [''],
      groupId: ['', Validators.required],
    });
  }

  ngOnInit(): void {
    if (this.isEditMode && this.data.project) {
      this.projectForm.patchValue({
        name: this.data.project.name,
        description: this.data.project.description,
        groupId: this.data.project.groupId._id,
      });
    }
    this.loadGroups();
  }

  loadGroups(): void {
    this.isLoading = true;
    this.error = null;

    this.groupService.getGroups().subscribe({
      next: (groups: Group[]) => {
        this.groups = groups;
        this.isLoading = false;
      },
      error: (error: Error) => {
        console.error('Error loading groups:', error);
        this.error = 'Failed to load groups. Please try again.';
        this.isLoading = false;
      },
    });
  }

  onSubmit(): void {
    if (this.projectForm.invalid) {
      return;
    }

    this.isLoading = true;
    this.error = null;

    const formData = this.projectForm.value;

    if (this.isEditMode && this.data.project) {
      const updateData: UpdateProjectDto = {
        name: formData.name,
        description: formData.description,
        groupId: formData.groupId,
      };

      this.projectService
        .updateProject(this.data.project._id, updateData)
        .subscribe({
          next: (updatedProject) => {
            this.isLoading = false;
            this.dialogRef.close(updatedProject);
            this.snackBar.open('Project updated successfully', 'Close', {
              duration: 3000,
            });
          },
          error: (error) => {
            this.isLoading = false;
            this.error = 'Failed to update project. Please try again.';
            console.error('Error updating project:', error);
            this.snackBar.open('Failed to update project', 'Close', {
              duration: 3000,
            });
          },
        });
    } else {
      const createData: CreateProjectDto = {
        name: formData.name,
        description: formData.description,
        groupId: formData.groupId,
      };

      this.projectService.createProject(createData).subscribe({
        next: (newProject) => {
          this.isLoading = false;
          this.dialogRef.close(newProject);
          this.snackBar.open('Project created successfully', 'Close', {
            duration: 3000,
          });
        },
        error: (error) => {
          this.isLoading = false;
          this.error = 'Failed to create project. Please try again.';
          console.error('Error creating project:', error);
          this.snackBar.open('Failed to create project', 'Close', {
            duration: 3000,
          });
        },
      });
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  getErrorMessage(controlName: string): string {
    const control = this.projectForm.get(controlName);
    if (!control) return '';

    if (control.hasError('required')) {
      return 'This field is required';
    }

    if (control.hasError('minlength')) {
      return `Minimum length is ${control.errors?.['minlength'].requiredLength} characters`;
    }

    return '';
  }
}
