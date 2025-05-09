import { Component, OnDestroy } from '@angular/core';
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
import { Subject, interval } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    CollabLogoSvgComponent,
    HttpClientModule,
    RouterModule,
  ],
  providers: [AuthService],
})
export class ForgotPasswordComponent implements OnDestroy {
  forgotPasswordForm: FormGroup;
  isSubmitting = false;
  errorMessage = '';
  successMessage = '';
  countdown = 0;
  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private authService: AuthService
  ) {
    this.forgotPasswordForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
    });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  startCountdown() {
    this.countdown = 3;
    interval(1000)
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.countdown--;
        if (this.countdown <= 0) {
          this.router.navigate(['/login']);
        }
      });
  }

  onSubmit() {
    if (this.forgotPasswordForm.invalid) {
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';
    this.successMessage = '';

    const email = this.forgotPasswordForm.get('email')?.value;

    this.authService.forgotPassword(email).subscribe({
      next: () => {
        this.isSubmitting = false;
        this.successMessage =
          'Password reset instructions have been sent to your email.';
        this.startCountdown();
      },
      error: (error) => {
        this.isSubmitting = false;
        if (error.status === 404) {
          this.errorMessage = 'No account found with this email address.';
        } else if (error.status === 429) {
          this.errorMessage = 'Too many attempts. Please try again later.';
        } else {
          this.errorMessage =
            error.error?.message ||
            'Failed to process request. Please try again.';
        }
      },
    });
  }
}
