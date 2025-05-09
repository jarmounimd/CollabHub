import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { Subscription } from 'rxjs';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-verify-email',
  standalone: true,
  imports: [CommonModule, HttpClientModule],
  providers: [AuthService],
  templateUrl: './verify-email.component.html',
  styleUrls: ['./verify-email.component.scss']
})
export class VerifyEmailComponent implements OnInit, OnDestroy {
  isVerifying = false;
  isSuccess = false;
  message = '';
  error = '';
  email = '';
  messageClass = 'success-message';
  private verificationSubscription?: Subscription;
  private hasStartedVerification = false;
  private verificationStarted = false;
  public verificationCompleted = false;  

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit() {
    // Check if verification has already been completed in this session
    const verificationStatus = sessionStorage.getItem('verificationCompleted');
    if (verificationStatus === 'true') {
      this.isSuccess = true;
      this.message = 'Email verified successfully! You can now log in.';
      this.messageClass = 'success-message';
      setTimeout(() => {
        this.router.navigate(['/login']);
      }, 3000);
      return;
    }

    if (this.hasStartedVerification) return;

    const token = this.route.snapshot.queryParamMap.get('token');
    if (token && !this.verificationStarted) {
      this.hasStartedVerification = true;
      this.verifyEmail(token);
    } else {
      this.error = 'Invalid verification link';
    }
  }

  ngOnDestroy() {
    if (this.verificationSubscription) {
      this.verificationSubscription.unsubscribe();
    }
  }

  verifyEmail(token: string) {
    if (this.verificationStarted || this.isVerifying || this.verificationCompleted) return;

    this.verificationStarted = true;
    this.isVerifying = true;
    this.error = '';
    this.message = '';

    if (this.verificationSubscription) {
      this.verificationSubscription.unsubscribe();
    }

    this.verificationSubscription = this.authService.verifyEmail(token).subscribe({
      next: () => {
        // Add delay to show the verification process
        setTimeout(() => {
          this.isVerifying = false;
          this.isSuccess = true;
          this.message = 'Email verified successfully! You can now log in.';
          this.messageClass = 'success-message';
          this.error = '';
          this.verificationCompleted = true;
          
          // Store verification status in session storage
          sessionStorage.setItem('verificationCompleted', 'true');
          
          // Delay before redirecting
          setTimeout(() => {
            this.router.navigate(['/login']);
          }, 1000);
        }, 2000);
      },
      error: (error) => {
        // Add delay to show the verification process
        setTimeout(() => {
          this.isVerifying = false;
          this.verificationStarted = false;
          this.message = '';

          if (error.status === 409) {
            this.isSuccess = true;
            this.message = 'Email already verified. You can log in.';
            this.messageClass = 'success-message';
            this.error = '';
            this.verificationCompleted = true;
            
            // Store verification status in session storage
            sessionStorage.setItem('verificationCompleted', 'true');
            
            setTimeout(() => {
              this.router.navigate(['/login']);
            }, 5000);
          } else {
            this.error = error.error?.message || 'Verification failed. Please try again.';
            this.email = error.error?.email;
          }
        }, 2000);
      }
    });
  }

  resendVerification() {
    if (!this.email || this.isVerifying || this.verificationCompleted) return;

    this.authService.resendVerification(this.email).subscribe({
      next: () => {
        this.message = 'Verification email sent! Please check your inbox.';
        this.error = '';
        this.messageClass = 'success-message';
      },
      error: (error) => {
        this.error = error.error?.message || 'Failed to resend verification email.';
      }
    });
  }
}
