import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { User } from '../models/user.model';
import { environment } from '../../../environments/environment';
import { AuthStateService } from './auth-state.service';

interface RegisterDto {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

interface LoginDto {
  email: string;
  password: string;
}

interface AuthResponse {
  access_token: string;
  user: User;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = `${environment.apiUrl}/auth`;

  constructor(private http: HttpClient, private authState: AuthStateService) {}

  register(data: RegisterDto): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${this.apiUrl}/register`, data)
      .pipe(tap((response) => this.handleAuthResponse(response)));
  }

  login(data: LoginDto): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${this.apiUrl}/login`, data)
      .pipe(tap((response) => this.handleAuthResponse(response)));
  }

  logout(): void {
    this.authState.clearAuthState();
  }

  // Add getCurrentUserId method
  getCurrentUserId(): string | null {
    const user = this.authState.getUser();
    return user?._id || null;
  }

  isAuthenticated(): boolean {
    return this.authState.isAuthenticated();
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  verifyEmail(token: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/verify-email`, { token });
  }

  resendVerification(email: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/resend-verification`, { email });
  }

  forgotPassword(email: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/forgot-password`, { email });
  }

  resetPassword(token: string, newPassword: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/reset-password`, {
      token,
      newPassword,
    });
  }

  private handleAuthResponse(response: AuthResponse): void {
    localStorage.setItem('token', response.access_token);
    localStorage.setItem('user', JSON.stringify(response.user));
    this.authState.setAuthState(response.user, true);
  }
}
