import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Check if we're in the browser
  if (typeof window !== 'undefined') {
    // If authenticated, allow access
    if (authService.isAuthenticated()) {
      return true;
    }

    // If not authenticated and trying to access protected route, redirect to login
    return router.parseUrl('/login');
  }

  // For server-side rendering, just check the auth state
  return authService.isAuthenticated();
};
