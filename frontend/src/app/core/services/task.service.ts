import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import {
  Task,
  CreateTaskDto,
  UpdateTaskDto,
  TaskStatus,
} from '../models/task.model';

export interface TaskError {
  message: string;
  statusCode?: number;
}

@Injectable({
  providedIn: 'root',
})
export class TaskService {
  private apiUrl = `${environment.apiUrl}/tasks`;

  constructor(private http: HttpClient) {}

  // Create new task
  create(createTaskDto: CreateTaskDto): Observable<Task> {
    if (!createTaskDto.projectId) {
      return throwError(() => new Error('Project ID is required'));
    }
    return this.http.post<Task>(this.apiUrl, createTaskDto);
  }

  // Get tasks with filters
  getTasks(filters?: {
    projectId?: string;
    assignedTo?: string;
    createdBy?: string;
  }): Observable<Task[]> {
    let queryParams = new URLSearchParams();
    if (filters?.projectId) queryParams.append('projectId', filters.projectId);
    if (filters?.assignedTo)
      queryParams.append('assignedTo', filters.assignedTo);
    if (filters?.createdBy) queryParams.append('createdBy', filters.createdBy);

    const queryString = queryParams.toString();
    return this.http.get<Task[]>(
      `${this.apiUrl}${queryString ? `?${queryString}` : ''}`
    );
  }

  // Get tasks for specific project
  findProjectTasks(projectId: string): Observable<Task[]> {
    return this.http.get<Task[]>(`${this.apiUrl}/project/${projectId}`);
  }

  // Get tasks for specific user
  findUserTasks(
    userId: string,
    type: 'assigned' | 'created' = 'assigned'
  ): Observable<Task[]> {
    return this.http.get<Task[]>(`${this.apiUrl}/user/${userId}?type=${type}`);
  }

  // Get task statistics for project
  findTaskStats(projectId: string): Observable<{
    total: number;
    completed: number;
    inProgress: number;
    todo: number;
  }> {
    return this.http.get<any>(`${this.apiUrl}/project/${projectId}/stats`);
  }

  // Get single task
  findOne(id: string): Observable<Task> {
    return this.http.get<Task>(`${this.apiUrl}/${id}`);
  }

  // Update task
  update(id: string, updateTaskDto: UpdateTaskDto): Observable<Task> {
    return this.http.put<Task>(`${this.apiUrl}/${id}`, updateTaskDto);
  }

  // Update task status
  updateStatus(id: string, status: TaskStatus): Observable<Task> {
    return this.http.put<Task>(`${this.apiUrl}/${id}/status`, { status });
  }

  // Delete task
  remove(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  findUserAccessibleTasks(): Observable<Task[]> {
    return this.http.get<Task[]>(this.apiUrl).pipe(
      map((tasks) => tasks.filter((task) => task.projectId)), // Filter out any tasks without projects
      catchError((error: HttpErrorResponse) => {
        const taskError: TaskError = {
          message: error.error?.message || 'Failed to load tasks',
          statusCode: error.status,
        };
        return throwError(() => taskError);
      })
    );
  }
}
