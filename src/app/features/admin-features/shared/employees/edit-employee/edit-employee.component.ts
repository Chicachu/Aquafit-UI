import { Component, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import { UserService } from "@core/services/userService";
import { SnackBarService } from "@core/services/snackBarService";
import { TranslateService } from "@ngx-translate/core";
import { TextInputType } from "@core/types/enums/textInputType";
import { Role } from "@core/types/enums/role";
import { SelectOption } from "@core/types/selectOption";
import { User } from "@core/types/user";

@Component({
  selector: 'app-edit-employee',
  templateUrl: './edit-employee.component.html',
  styleUrls: ['./edit-employee.component.scss']
})
export class EditEmployeeComponent implements OnInit {
  readonly TextInputType = TextInputType
  readonly Role = Role
  form: FormGroup
  loading = false
  userId: string | null = null
  staffId: number | null = null
  loadedRole: Role | null = null
  roleOptions: SelectOption[] = [
    { value: Role.INSTRUCTOR, viewValue: 'INSTRUCTOR' },
    { value: Role.EMPLOYEE, viewValue: 'EMPLOYEE' }
  ]

  get editBreadcrumbTitle(): string {
    return this.loadedRole === Role.INSTRUCTOR ? 'EMPLOYEES.EDIT_INSTRUCTOR' : 'EMPLOYEES.EDIT_EMPLOYEE'
  }

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private snackBarService: SnackBarService,
    private translateService: TranslateService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.form = this.fb.group({
      firstName: ['', [Validators.required]],
      lastName: ['', [Validators.required]],
      phoneNumber: ['', [
        Validators.required,
        Validators.pattern('^[+]?[0-9 ]*$'),
        Validators.maxLength(15)
      ]],
      role: [Role.EMPLOYEE, [Validators.required]]
    })
  }

  ngOnInit(): void {
    this.userId = this.route.snapshot.paramMap.get('user-id')
    if (!this.userId) return

    this.userService.getUser(this.userId).subscribe({
      next: (user: User) => {
        this.loadedRole = user.role
        this.staffId = user.employeeId ?? null
        this.form.patchValue({
          firstName: user.firstName,
          lastName: user.lastName,
          phoneNumber: user.phoneNumber ?? '',
          role: user.role
        })
      },
      error: ({ error }) => {
        this.snackBarService.showError(error?.message ?? '')
      }
    })
  }

  get f() {
    return this.form.controls
  }

  onSubmit(): void {
    if (this.form.valid && this.userId) {
      this.loading = true
      const role = this.f['role'].value as Role
      this.userService.updateClient(this.userId, {
        firstName: this.f['firstName'].value.trim(),
        lastName: this.f['lastName'].value.trim(),
        phoneNumber: this.f['phoneNumber'].value?.trim(),
        role,
        employeeId: this.staffId
      }).subscribe({
        next: () => {
          this.loading = false
          this.snackBarService.showSuccess(this.translateService.instant('EMPLOYEES.UPDATE_SUCCESS'))
          this.router.navigate(['../details'], { relativeTo: this.route })
        },
        error: ({ error }) => {
          this.loading = false
          this.snackBarService.showError(error?.message ?? '')
        }
      })
    } else {
      this.form.markAllAsTouched()
    }
  }
}
