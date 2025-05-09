import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { User } from '../../../core/models/user.model';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { LogoComponent } from '../logo/logo.component';
import { AuthStateService } from '../../../core/services/auth-state.service';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    LogoComponent,
    RouterModule,
  ],
})
export class HeaderComponent implements OnInit, OnDestroy {
  showProfileMenu = false;
  private destroy$ = new Subject<void>();
  isAuthenticated$;
  currentUser$;
  isLoading$;

  constructor(
    private authService: AuthService,
    private authState: AuthStateService,
    private router: Router
  ) {
    this.isAuthenticated$ = this.authState.isAuthenticated$;
    this.currentUser$ = this.authState.currentUser$;
    this.isLoading$ = this.authState.isLoading$;
  }

  ngOnInit() {
    // No need to call getCurrentUser() as we already have the data in AuthStateService
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (!target.closest('.profile-container')) {
      this.showProfileMenu = false;
    }
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  toggleProfileMenu(event: Event) {
    event.stopPropagation();
    this.showProfileMenu = !this.showProfileMenu;
  }

  goToProfile() {
    this.router.navigate(['/profile']);
    this.showProfileMenu = false;
  }

  goToSettings() {
    this.router.navigate(['/settings']);
    this.showProfileMenu = false;
  }

  logout(): void {
    this.authService.logout();
    this.showProfileMenu = false;
    this.router.navigate(['/login']);
  }
}
