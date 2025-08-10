import { Component, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth';
import { ButtonComponent } from '../../components/ui/button/button';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ButtonComponent],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class LoginComponent {
  // Inject services
  private authService = inject(AuthService);
  private fb = inject(FormBuilder);
  private router = inject(Router);

  loginForm: FormGroup;
  showPassword = signal(false);

  // Get auth state from service
  authState = this.authService.state;

  // Computed properties for template
  isLoading = computed(() => this.authState().loading);
  errorMessage = computed(() => this.authState().error);

  constructor() {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  /**
   * Toggle password visibility
   */
  togglePasswordVisibility(): void {
    this.showPassword.update(show => !show);
  }

  /**
   * Handle form submission
   */
  onSubmit(): void {
    if (this.loginForm.valid && !this.isLoading()) {
      const credentials = this.loginForm.value;

      this.authService.login(credentials).subscribe({
        next: (response) => {
          if (response.message === "Login successful" && response.user) {
            // Redirect to dashboard on successful login
            this.router.navigate(['/dashboard']);
          }
        },
        error: (error) => {
          // Error is handled by the service and available in authState
          console.error('Login failed:', error);
        }
      });
    } else {
      // Mark all fields as touched to show validation errors
      this.markFormGroupTouched();
    }
  }  /**
   * Check if a form field has an error
   */
  hasFieldError(fieldName: string): boolean {
    const field = this.loginForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  /**
   * Get error message for a specific field
   */
  getFieldError(fieldName: string): string {
    const field = this.loginForm.get(fieldName);

    if (field?.errors) {
      if (field.errors['required']) {
        return `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} is required`;
      }
      if (field.errors['email']) {
        return 'Please enter a valid email address';
      }
      if (field.errors['minlength']) {
        return `Password must be at least ${field.errors['minlength'].requiredLength} characters`;
      }
    }

    return '';
  }

  /**
   * Mark all form fields as touched to trigger validation display
   */
  private markFormGroupTouched(): void {
    Object.keys(this.loginForm.controls).forEach(key => {
      const control = this.loginForm.get(key);
      control?.markAsTouched();
    });
  }
}
