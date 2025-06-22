import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { User } from '../models/user.model';

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
  // Use the direct backend URL
  private baseUrl = 'http://localhost:3000';

  constructor(private http: HttpClient) {}

  getGroups(): Observable<Group[]> {
    return this.http.get<Group[]>(`${this.baseUrl}/groups`);
  }

  getGroup(id: string): Observable<Group> {
    return this.http.get<Group>(`${this.baseUrl}/groups/${id}`);
  }

  createGroup(group: CreateGroupDto): Observable<Group> {
    return this.http.post<Group>(`${this.baseUrl}/groups`, group);
  }

  updateGroup(id: string, group: UpdateGroupDto): Observable<Group> {
    return this.http.put<Group>(`${this.baseUrl}/groups/${id}`, group);
  }

  deleteGroup(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/groups/${id}`);
  }

  addMember(groupId: string, userId: string): Observable<Group> {
    return this.http.post<Group>(`${this.baseUrl}/groups/${groupId}/members`, {
      userId,
    });
  }

  removeMember(groupId: string, userId: string): Observable<Group> {
    return this.http.delete<Group>(
      `${this.baseUrl}/groups/${groupId}/members/${userId}`
    );
  }

  getGroupMembers(groupId: string): Observable<User[]> {
    return this.http.get<User[]>(`${this.baseUrl}/groups/${groupId}/members`);
  }
}
