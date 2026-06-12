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
import { ButtonType } from "../../breadcrumb-nav-bar/breadcrumb-nav-bar.component";

@Component({
  selector: 'app-add-employee',
  templateUrl: './add-employee.component.html',
  styleUrls: ['./add-employee.component.scss']
})
export class AddEmployeeComponent implements OnInit {
  @HostBinding('class.panel-view') panelView = false

  readonly ButtonType = ButtonType
  readonly TextInputType = TextInputType
  readonly Role = Role
  form: FormGroup
  loading = false
  staffId: number | null = null
  roleOptions = STAFF_MANAGEMENT_ROLE_OPTIONS

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
      role: [Role.INSTRUCTOR, [Validators.required]]
    })
  }

  ngOnInit(): void {
    if (this.route.snapshot.data['panelView'] === true) {
      this.panelView = true
    }

    this.userService.getNextEmployeeId().subscribe({
      next: (res) => {
        this.staffId = res.employeeId
      },
      error: ({ error }) => {
        this.snackBarService.showError(error?.message ?? 'Failed to load staff ID')
      }
    })
  }

  get f() {
    return this.form.controls
  }

  get breadcrumbBackRoute(): string[] | null {
    return this.panelView ? ['/admin/employees'] : null
  }

  onSubmit(): void {
    if (this.form.valid && this.staffId !== null) {
      this.loading = true
      const role = this.f['role'].value as Role
      this.userService.addNewClient({
        firstName: this.f['firstName'].value.trim(),
        lastName: this.f['lastName'].value.trim(),
        phoneNumber: this.f['phoneNumber'].value?.trim(),
        role,
        employeeId: this.staffId
      }).subscribe({
        next: (createdEmployee: User) => {
          this.loading = false
          this.snackBarService.showSuccess(this.translateService.instant('EMPLOYEES.ADD_EMPLOYEE_SUCCESS'))
          this._navigateAfterAdd(createdEmployee._id)
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

  private _navigateAfterAdd(employeeId: string): void {
    if (this.panelView) {
      this.router.navigate(['/admin/employees', employeeId, 'details'])
      return
    }

    this.router.navigate(['/admin/mobile/employees'])
  }
}
