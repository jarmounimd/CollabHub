import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface FileMeta {
  _id: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  fileUrl: string;
  uploadedBy: any;
  projectId: string;
  createdAt: string;
  updatedAt: string;
}

@Injectable({ providedIn: 'root' })
export class FileService {
  private apiUrl = `${environment.apiUrl}/files`;

  constructor(private http: HttpClient) {}

  getFilesByProject(projectId: string): Observable<FileMeta[]> {
    return this.http.get<FileMeta[]>(`${this.apiUrl}?projectId=${projectId}`);
  }

  uploadFile(file: File, projectId: string): Observable<FileMeta> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('projectId', projectId);
    return this.http.post<FileMeta>(`${this.apiUrl}/upload?projectId=${projectId}`, formData);
  }

  downloadFile(fileId: string): Observable<{ fileUrl: string }> {
    return this.http.get<{ fileUrl: string }>(`${this.apiUrl}/download/${fileId}`);
  }

  deleteFile(fileId: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${fileId}`);
  }
}