import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthenticationService } from '../../../core/services/authenticationService';
import { SnackBarService } from '../../../core/services/snackBarService';
import { TranslateService } from '@ngx-translate/core';
import { User } from '../../../core/types/user';
import { Role } from '../../../core/types/enums/role';
import { Router } from '@angular/router';
import { UserService } from '../../../core/services/userService';
import { ErrorMessageProvider, ErrorsService } from '../../../core/services/errorsService';
import { TextInputType } from '../../../core/types/enums/textInputType';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  readonly TextInputType = TextInputType
  loginForm: FormGroup
  loading = false

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
      email: [''],
      password: ['']
    });
  }

  ngOnInit(): void {
    if (this.userService.isUserLoggedIn) {
      const user = this.userService.user!;
      const isStaff = user.role === Role.ADMIN || user.role === Role.INSTRUCTOR || user.role === Role.EMPLOYEE;
      this.router.navigate([isStaff ? '/admin/home' : '/home']);
    }
  }

  get f() { 
    return this.loginForm.controls; 
  }

  onSubmit() {
    if (this.loginForm.valid) {
      this.loading = true
      
      this.authService.login(this.f['email'].value, this.f['password'].value).subscribe({
        next: (user: User) => {
          this.loading = false;
          this.userService.user = user
          const displayName = user.firstName ?? user.username ?? (user.employeeId != null ? String(user.employeeId) : '')
          this.snackBarService.showSuccess(this.translateService.instant('LOGIN.WELCOME', { name: displayName }))
          const isStaff = user.role === Role.ADMIN || user.role === Role.INSTRUCTOR || user.role === Role.EMPLOYEE
          this.router.navigate([isStaff ? '/admin/home' : '/home'])
          this.loginForm.reset()
        },
        error: ({error}) => {
          this.loading = false
          this.snackBarService.showError(error.message)
        }
      })
    } else {
      this.loginForm.markAllAsTouched()
    }
  }

  getErrorMessage(controlName: string): string {
    return ''
  }
}
