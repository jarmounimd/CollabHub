import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { User } from '../models/user.model';

@Injectable({
  providedIn: 'root',
})
export class AuthStateService {
  private user = new BehaviorSubject<User | null>(null);
  private authenticated = new BehaviorSubject<boolean>(false);
  private loading = new BehaviorSubject<boolean>(false);

  // Public observables
  user$ = this.user.asObservable();
  authenticated$ = this.authenticated.asObservable();
  isLoading$ = this.loading.asObservable();
  currentUser$ = this.user.asObservable();
  isAuthenticated$ = this.authenticated.asObservable();

  getUser(): User | null {
    return this.user.getValue();
  }

  isAuthenticated(): boolean {
    return this.authenticated.getValue();
  }

  setAuthState(user: User | null, isAuthenticated: boolean): void {
    this.user.next(user);
    this.authenticated.next(isAuthenticated);
  }

  clearAuthState(): void {
    this.user.next(null);
    this.authenticated.next(false);
  }

  setLoading(isLoading: boolean): void {
    this.loading.next(isLoading);
  }
}
