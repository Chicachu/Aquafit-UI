import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthenticationService } from '../../../core/services/authenticationService';
import { SnackBarService } from '../../../core/services/snackBarService';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  loginForm: FormGroup;
  hidePassword = true;
  loading = false;

  constructor(
    private authService: AuthenticationService,
    private formBuilder: FormBuilder,
    private snackBarService: SnackBarService
  ) 
  {
    this.loginForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  ngOnInit(): void {}

  // Getter for easy access to form fields
  get f() { 
    return this.loginForm.controls; 
  }

  onSubmit() {
    if (this.loginForm.valid) {
      this.loading = true;
      
      this.authService.login(this.loginForm.controls['email'].value, this.loginForm.controls['password'].value).subscribe({
        next: (rsp) => {
          this.loading = false;
          this.snackBarService.showSuccess('Login successful!');
        },
        error: ({error}) => {
          this.loading = false;
          this.snackBarService.showError(error.message)
        }
      })
    } else {
      this.markFormGroupTouched(this.loginForm);
    }
  }

  // Helper method to trigger validation on all fields
  private markFormGroupTouched(formGroup: FormGroup) {
    Object.values(formGroup.controls).forEach(control => {
      control.markAsTouched();
      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }

  getErrorMessage(controlName: string): string {
    const control = this.loginForm.get(controlName);
    if (control?.hasError('required')) {
      return `${controlName.charAt(0).toUpperCase() + controlName.slice(1)} is required`;
    }
    if (control?.hasError('email')) {
      return 'Please enter a valid email address';
    }
    if (control?.hasError('minlength')) {
      return 'Password must be at least 6 characters';
    }
    return '';
  }
}
