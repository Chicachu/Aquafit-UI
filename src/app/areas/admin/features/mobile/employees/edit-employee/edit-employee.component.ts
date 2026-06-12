import { Component, HostBinding, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import { UserService } from "@core/services/userService";
import { SnackBarService } from "@core/services/snackBarService";
import { TranslateService } from "@ngx-translate/core";
import { TextInputType } from "@core/types/enums/textInputType";
import { Role } from "@core/types/enums/role";
import { STAFF_MANAGEMENT_ROLE_OPTIONS } from "@core/constants/staffManagementRoles";
import { User } from "@core/types/user";
import { MustMatch } from "@shared/validators/mustMatch";
import { ButtonType } from "../../breadcrumb-nav-bar/breadcrumb-nav-bar.component";
import { ClassService } from "@core/services/classService";
import { SelectOption } from "@core/types/selectOption";

@Component({
  selector: 'app-edit-employee',
  templateUrl: './edit-employee.component.html',
  styleUrls: ['./edit-employee.component.scss']
})
export class EditEmployeeComponent implements OnInit {
  @HostBinding('class.panel-view') panelView = false

  readonly ButtonType = ButtonType
  readonly TextInputType = TextInputType
  readonly Role = Role
  form: FormGroup
  loading = false
  userId: string | null = null
  staffId: number | null = null
  loadedRole: Role | null = null
  roleOptions = STAFF_MANAGEMENT_ROLE_OPTIONS
  locationOptions: SelectOption[] = []

  get editBreadcrumbTitle(): string {
    if (this.loadedRole === Role.INSTRUCTOR) return 'EMPLOYEES.EDIT_INSTRUCTOR'
    if (this.loadedRole === Role.MANAGER) return 'EMPLOYEES.EDIT_MANAGER'
    if (this.loadedRole === Role.RECEPTIONIST) return 'EMPLOYEES.EDIT_RECEPTIONIST'
    return 'EMPLOYEES.EDIT_EMPLOYEE'
  }

  get breadcrumbBackRoute(): string[] | null {
    if (!this.panelView) {
      return null
    }

    if (this.userId) {
      return ['/admin/employees', this.userId, 'details']
    }

    return ['/admin/employees']
  }

  constructor(
    private fb: FormBuilder,
    private classService: ClassService,
    private userService: UserService,
    private snackBarService: SnackBarService,
    private translateService: TranslateService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.form = this.fb.group(
      {
        firstName: ['', [Validators.required]],
        lastName: ['', [Validators.required]],
        phoneNumber: ['', [
          Validators.required,
          Validators.pattern('^[+]?[0-9 ]*$'),
          Validators.maxLength(15)
        ]],
        role: [Role.INSTRUCTOR, [Validators.required]],
        workLocation: [''],
        password: [''],
        confirmPassword: ['']
      },
      { validators: [MustMatch('password', 'confirmPassword')] }
    )
  }

  ngOnInit(): void {
    if (this.route.snapshot.data['panelView'] === true) {
      this.panelView = true
    }

    this.userId = this.route.snapshot.paramMap.get('user-id')
    if (!this.userId) return

    this.classService.getAllLocations().subscribe({
      next: (locations) => {
        this.locationOptions = locations.map((location) => ({
          value: location,
          viewValue: location
        }))
      },
      error: ({ error }) => {
        this.snackBarService.showError(error?.message ?? '')
      }
    })

    this.userService.getUser(this.userId).subscribe({
      next: (user: User) => {
        this.loadedRole = user.role
        this.staffId = user.employeeId ?? null
        this.form.patchValue({
          firstName: user.firstName,
          lastName: user.lastName,
          phoneNumber: user.phoneNumber ?? '',
          role: user.role,
          workLocation: user.workLocation ?? ''
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
      const workLocation = this.f['workLocation'].value?.trim()
      const payload: Parameters<UserService['updateClient']>[1] = {
        firstName: this.f['firstName'].value.trim(),
        lastName: this.f['lastName'].value.trim(),
        phoneNumber: this.f['phoneNumber'].value?.trim(),
        role,
        employeeId: this.staffId,
        workLocation: workLocation || null
      }
      const pwd = this.form.get('password')?.value
      if (typeof pwd === 'string' && pwd.trim().length > 0) {
        payload.password = pwd.trim()
      }
      this.userService.updateClient(this.userId, payload).subscribe({
        next: () => {
          this.loading = false
          this.snackBarService.showSuccess(this.translateService.instant('EMPLOYEES.UPDATE_SUCCESS'))
          if (this.panelView && this.userId) {
            this.router.navigate(['/admin/employees', this.userId, 'details'])
            return
          }

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
