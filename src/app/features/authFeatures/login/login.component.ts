import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthenticationService } from '../../../core/services/authenticationService';
import { SnackBarService } from '../../../core/services/snackBarService';
import { TranslateService } from '@ngx-translate/core';
import { User } from '../../../core/types/user';
import { internalEmailRegex } from '../../../core/constants';
import { Router } from '@angular/router';
import { UserService } from '../../../core/services/userService';

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
    private snackBarService: SnackBarService,
    private translateService: TranslateService,
    private router: Router,
    private userService: UserService
  ) 
  {
    this.loginForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  ngOnInit(): void {}

  get f() { 
    return this.loginForm.controls; 
  }

  onSubmit() {
    if (this.loginForm.valid) {
      this.loading = true;
      
      this.authService.login(this.f['email'].value, this.f['password'].value).subscribe({
        next: (user: User) => {
          this.loading = false;
          this.userService.user = user
          this.snackBarService.showSuccess(this.translateService.instant('LOGIN.WELCOME', { name: user.username }));
          if (internalEmailRegex.test(user.username!)) {
            this.router.navigate(['/admin/home'])
          } else {
            this.router.navigate(['/home'])
          }
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
      return this.translateService.instant('ERRORS.REQUIRED', { field: this.translateService.instant(`AUTH.${controlName.toUpperCase()}`) });;
    }
    if (control?.hasError('email')) {
      return this.translateService.instant('ERRORS.INVALID_EMAIL');
    }
    if (control?.hasError('minlength')) {
      return this.translateService.instant('ERRORS.MIN_LENGTH', { field: this.translateService.instant(`AUTH.${controlName.toUpperCase()}`), minLength: 6 });
    }
    return '';
  }
}
