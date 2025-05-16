import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MustMatch } from '../../../shared/validators/mustMatch';
import { TranslateService } from '@ngx-translate/core';
import { SnackBarService } from '../../../core/services/snackBarService';
import { UserService } from '../../../core/services/userService';
import { Role } from '../../../core/types/enums/role';
import { internalEmailRegex } from '../../../core/constants';
import { ErrorsService } from '../../../core/services/errorsService';
import { TextInputType } from '../../../core/types/enums/textInputType';
import { Router } from '@angular/router';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss'
})
export class RegisterComponent {
  readonly TextInputType = TextInputType
  registerForm: FormGroup
  hidePassword = true
  loading = false
 
  constructor(
    private formBuilder: FormBuilder,
    private translateService: TranslateService,
    private userService: UserService,
    private snackBarService: SnackBarService,
    private router: Router
    ) {
    this.registerForm = this.formBuilder.group(
    {
      email: [''],
      password: [''],
      confirmPassword: ['']
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
          this.router.navigate(["/login"])
          this.snackBarService.showSuccess(this.translateService.instant('REGISTER.SUCCESS'));
        },
        error: ({error}) => {
          this.loading = false;
          this.snackBarService.showError(error.message)
        }
      })
    } else {
      this.registerForm.markAllAsTouched()
    }
  }
}
