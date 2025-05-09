import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { CollabLogoSvgComponent } from '../../shared/components/collab-logo-svg/collab-logo-svg.component';
import { AuthService } from '../../core/services/auth.service';
import { HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.scss'],
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
export class ResetPasswordComponent implements OnInit {
  resetPasswordForm: FormGroup;
  isSubmitting = false;
  errorMessage = '';
  successMessage = '';
  token: string = '';
  showPassword = false;
  showConfirmPassword = false;
  passwordStrength = 0;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private authService: AuthService
  ) {
    this.resetPasswordForm = this.fb.group(
      {
        password: [
          '',
          [
            Validators.required,
            Validators.minLength(8),
            Validators.pattern(
              /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/
            ),
          ],
        ],
        confirmPassword: ['', [Validators.required]],
      },
      {
        validators: this.passwordMatchValidator,
      }
    );

    // Subscribe to password changes to calculate strength
    this.resetPasswordForm
      .get('password')
      ?.valueChanges.subscribe((password) => {
        this.calculatePasswordStrength(password);
      });
  }

  ngOnInit() {
    this.token = this.route.snapshot.queryParamMap.get('token') || '';
    if (!this.token) {
      this.errorMessage = 'Invalid reset password link';
    }
  }

  calculatePasswordStrength(password: string) {
    if (!password) {
      this.passwordStrength = 0;
      return;
    }

    let strength = 0;
    // Length check
    if (password.length >= 8) strength += 1;
    // Contains number
    if (/\d/.test(password)) strength += 1;
    // Contains lowercase
    if (/[a-z]/.test(password)) strength += 1;
    // Contains uppercase
    if (/[A-Z]/.test(password)) strength += 1;
    // Contains special character
    if (/[^A-Za-z0-9]/.test(password)) strength += 1;

    this.passwordStrength = (strength / 5) * 100;
  }

  getStrengthClass(): string {
    if (this.passwordStrength >= 80) return 'strong';
    if (this.passwordStrength >= 60) return 'medium';
    if (this.passwordStrength >= 40) return 'weak';
    return 'very-weak';
  }

  getStrengthText(): string {
    if (this.passwordStrength >= 80) return 'Strong';
    if (this.passwordStrength >= 60) return 'Medium';
    if (this.passwordStrength >= 40) return 'Weak';
    return 'Very Weak';
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  toggleConfirmPasswordVisibility() {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  passwordMatchValidator(form: FormGroup) {
    const password = form.get('password')?.value;
    const confirmPassword = form.get('confirmPassword')?.value;

    if (password !== confirmPassword) {
      form.get('confirmPassword')?.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    }

    return null;
  }

  // Password validation methods
  hasMinLength(): boolean {
    const password = this.resetPasswordForm.get('password')?.value;
    return password?.length >= 8;
  }

  hasUppercase(): boolean {
    const password = this.resetPasswordForm.get('password')?.value;
    return /[A-Z]/.test(password);
  }

  hasLowercase(): boolean {
    const password = this.resetPasswordForm.get('password')?.value;
    return /[a-z]/.test(password);
  }

  hasNumber(): boolean {
    const password = this.resetPasswordForm.get('password')?.value;
    return /\d/.test(password);
  }

  hasSpecialChar(): boolean {
    const password = this.resetPasswordForm.get('password')?.value;
    return /[^A-Za-z0-9]/.test(password);
  }

  onSubmit() {
    if (this.resetPasswordForm.invalid || !this.token) {
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';
    this.successMessage = '';

    const newPassword = this.resetPasswordForm.get('password')?.value;

    this.authService.resetPassword(this.token, newPassword).subscribe(
      (response) => {
        this.isSubmitting = false;
        this.successMessage = 'Password has been reset successfully!';
        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 3000);
      },
      (error) => {
        this.isSubmitting = false;
        this.errorMessage =
          error.error?.message || 'Failed to reset password. Please try again.';
      }
    );
  }
}
