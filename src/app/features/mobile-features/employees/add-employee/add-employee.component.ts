import { Component, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { Router } from "@angular/router";
import { UserService } from "@core/services/userService";
import { SnackBarService } from "@core/services/snackBarService";
import { TranslateService } from "@ngx-translate/core";
import { TextInputType } from "@core/types/enums/textInputType";
import { Role } from "@core/types/enums/role";
import { SelectOption } from "@core/types/selectOption";

@Component({
  selector: 'app-add-employee',
  templateUrl: './add-employee.component.html',
  styleUrls: ['./add-employee.component.scss']
})
export class AddEmployeeComponent implements OnInit {
  readonly TextInputType = TextInputType
  readonly Role = Role
  form: FormGroup
  loading = false
  staffId: number | null = null
  roleOptions: SelectOption[] = [
    { value: Role.INSTRUCTOR, viewValue: 'INSTRUCTOR' },
    { value: Role.EMPLOYEE, viewValue: 'EMPLOYEE' }
  ]

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private snackBarService: SnackBarService,
    private translateService: TranslateService,
    private router: Router
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
        next: () => {
          this.loading = false
          this.snackBarService.showSuccess(this.translateService.instant('EMPLOYEES.ADD_EMPLOYEE_SUCCESS'))
          this.router.navigate(['/admin/mobile/employees'])
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
