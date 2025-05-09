import { Component, OnInit, PLATFORM_ID, Inject } from '@angular/core';
import { RouterOutlet, Router } from '@angular/router';
import { HeaderComponent } from './shared/components/header/header.component';
import { FooterComponent } from './shared/components/footer/footer.component';
import { AuthService } from './core/services/auth.service';
import { AuthStateService } from './core/services/auth-state.service';
import { isPlatformBrowser } from '@angular/common';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  standalone: true,
  imports: [
    RouterOutlet,
    HeaderComponent,
    FooterComponent,
    MatProgressSpinnerModule,
    CommonModule,
  ],
})
export class AppComponent implements OnInit {
  title = 'CollabHub';
  private isBrowser: boolean;
  isLoading$;

  constructor(
    private router: Router,
    private authService: AuthService,
    private authState: AuthStateService,
    @Inject(PLATFORM_ID) platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
    this.isLoading$ = this.authState.isLoading$;
  }

  ngOnInit() {
    if (this.isBrowser) {
      // Check if we have stored auth data
      const token = localStorage.getItem('token');
      const userData = localStorage.getItem('user');

      if (token && userData) {
        try {
          const user = JSON.parse(userData);
          this.authState.setAuthState(user, true);

          // If on login page, redirect to dashboard
          if (window.location.pathname === '/login') {
            this.router.navigate(['/dashboard']);
          }
        } catch (error) {
          this.authState.clearAuthState();
          if (window.location.pathname !== '/login') {
            this.router.navigate(['/login']);
          }
        }
      } else {
        // No auth data, redirect to login if not already there
        if (window.location.pathname !== '/login') {
          this.router.navigate(['/login']);
        }
      }
      // Always set loading to false after initialization
      this.authState.setLoading(false);
    }
  }
}
