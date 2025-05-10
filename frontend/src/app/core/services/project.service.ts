import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Project {
  _id: string;
  name: string;
  description?: string;
  groupId: {
    _id: string;
    name: string;
    description?: string;
  };
  createdBy: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  createdAt: Date;
  updatedAt: Date;
  progress: number;
}

export interface CreateProjectDto {
  name: string;
  description?: string;
  groupId: string;
}

export interface UpdateProjectDto {
  name?: string;
  description?: string;
  groupId?: string;
}

@Injectable({
  providedIn: 'root',
})
export class ProjectService {
  private apiUrl = `${environment.apiUrl}/projects`;

  constructor(private http: HttpClient) {}

  createProject(project: CreateProjectDto): Observable<Project> {
    return this.http.post<Project>(this.apiUrl, project);
  }

  getProjects(groupId?: string): Observable<Project[]> {
    const url = groupId ? `${this.apiUrl}?groupId=${groupId}` : this.apiUrl;
    return this.http.get<Project[]>(url);
  }

  getProject(id: string): Observable<Project> {
    return this.http.get<Project>(`${this.apiUrl}/${id}`);
  }

  updateProject(id: string, project: UpdateProjectDto): Observable<Project> {
    return this.http.put<Project>(`${this.apiUrl}/${id}`, project);
  }

  deleteProject(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
