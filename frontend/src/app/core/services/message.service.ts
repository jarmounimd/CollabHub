import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment'; // <-- Add this

export interface Message {
  _id: string;
  messageText: string;
  projectId: string;
  senderId: string;
  attachments?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateMessageDto {
  messageText: string;
  projectId: string;
  attachments?: string[];
}

@Injectable({ providedIn: 'root' })
export class MessageService {
  private apiUrl = `${environment.apiUrl}/messages`; // <-- Use full backend URL

  constructor(private http: HttpClient) {}

  getMessagesByProject(projectId: string): Observable<Message[]> {
    return this.http.get<Message[]>(`${this.apiUrl}/project/${projectId}`);
  }

  sendMessage(dto: CreateMessageDto): Observable<Message> {
    return this.http.post<Message>(this.apiUrl, dto);
  }

  deleteMessage(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}