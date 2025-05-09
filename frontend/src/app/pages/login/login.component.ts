import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { CollabLogoSvgComponent } from '../../shared/components/collab-logo-svg/collab-logo-svg.component';
import { AuthService } from '../../core/services/auth.service';
import { HttpClientModule } from '@angular/common/http';
import { finalize, tap } from 'rxjs/operators';

@Component({
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    CollabLogoSvgComponent,
    HttpClientModule,
    RouterModule,
  ],
  providers: [AuthService],
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  isSubmitting = false;
  errorMessage = '';
  showPassword = false;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private authService: AuthService
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]],
      rememberMe: [false],
    });
  }

  ngOnInit() {
    // Check if already logged in
    if (this.authService.isAuthenticated()) {
      window.location.href = '/dashboard';
    }
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  onSubmit() {
    if (this.loginForm.invalid) {
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';

    const loginData = {
      email: this.loginForm.get('email')?.value,
      password: this.loginForm.get('password')?.value,
    };

    console.log('Attempting login...');

    this.authService
      .login(loginData)
      .pipe(
        finalize(() => {
          this.isSubmitting = false;
        })
      )
      .subscribe({
        next: (response) => {
          console.log('Login successful, navigating...');
          // Use window.location for a full page reload
          window.location.href = '/dashboard';
        },
        error: (error) => {
          console.error('Login error:', error);
          this.errorMessage =
            error.error?.message ||
            'Login failed. Please check your credentials.';
        },
      });
  }
}
