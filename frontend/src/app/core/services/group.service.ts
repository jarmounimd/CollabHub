import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Group {
  _id: string;
  name: string;
  description?: string;
  owner: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  members: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  }[];
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateGroupDto {
  name: string;
  description?: string;
  members?: string[];
}

export interface UpdateGroupDto {
  name?: string;
  description?: string;
}

export interface AddMemberDto {
  userId: string;
}

@Injectable({
  providedIn: 'root',
})
export class GroupService {
  private apiUrl = `${environment.apiUrl}/groups`;

  constructor(private http: HttpClient) {}

  getGroups(): Observable<Group[]> {
    return this.http.get<Group[]>(this.apiUrl);
  }

  getGroup(id: string): Observable<Group> {
    return this.http.get<Group>(`${this.apiUrl}/${id}`);
  }

  createGroup(group: CreateGroupDto): Observable<Group> {
    return this.http.post<Group>(this.apiUrl, group);
  }

  updateGroup(id: string, group: UpdateGroupDto): Observable<Group> {
    return this.http.put<Group>(`${this.apiUrl}/${id}`, group);
  }

  deleteGroup(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  addMember(groupId: string, userId: string): Observable<Group> {
    return this.http.post<Group>(`${this.apiUrl}/${groupId}/members`, {
      userId,
    });
  }

  removeMember(groupId: string, userId: string): Observable<Group> {
    return this.http.delete<Group>(
      `${this.apiUrl}/${groupId}/members/${userId}`
    );
  }
}
