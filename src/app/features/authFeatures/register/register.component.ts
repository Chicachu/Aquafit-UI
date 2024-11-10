import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MustMatch } from '../../../shared/validators/mustMatch';
import { TranslateService } from '@ngx-translate/core';
import { AuthenticationService } from '../../../core/services/authenticationService';
import { SnackBarService } from '../../../core/services/snackBarService';
import { UserService } from '../../../core/services/userService';
import { Role } from '../../../core/types/enums/role';
import { internalEmailRegex } from '../../../core/constants';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss'
})
export class RegisterComponent {
  registerForm: FormGroup;
  hidePassword = true;
  loading = false;
 
  constructor(
    private formBuilder: FormBuilder,
    private translateService: TranslateService,
    private userService: UserService,
    private snackBarService: SnackBarService
    ) {
    this.registerForm = this.formBuilder.group(
    {
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required, Validators.minLength(6)]]
    }, 
    {
      validators: [MustMatch('password', 'confirmPassword')]
    });
  }

  get f() { 
    return this.registerForm.controls; 
  }

  onSubmit() {
    if (this.registerForm.valid) {
      this.loading = true;

      const role = internalEmailRegex.test(this.f['email'].value) ? Role.INSTRUCTOR : Role.CLIENT
      
      this.userService.register(this.f['email'].value, this.f['password'].value, role).subscribe({
        next: (rsp) => {
          this.loading = false;
          this.snackBarService.showSuccess(this.translateService.instant('REGISTER.SUCCESS'));
        },
        error: ({error}) => {
          this.loading = false;
          this.snackBarService.showError(error.message)
        }
      })
    } else {
      this.markFormGroupTouched(this.registerForm);
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
    const control = this.registerForm.get(controlName);
    if (control?.hasError('required')) {
      return this.translateService.instant('ERRORS.REQUIRED', { field: this.translateService.instant(`AUTH.${controlName.toUpperCase()}`) });
    }
    if (control?.hasError('email')) {
      return this.translateService.instant('ERRORS.INVALID_EMAIL');
    }
    if (control?.hasError('minlength')) {
      return this.translateService.instant('ERRORS.MIN_LENGTH', { field: this.translateService.instant(`AUTH.${controlName.toUpperCase()}`), minLength: 6 });
    }
    if (control?.hasError('mustMatch')) {
      return this.translateService.instant('ERRORS.MUST_MATCH', { field: this.translateService.instant(`AUTH.${controlName.toUpperCase()}`) });
    }
    return '';
  }
}
