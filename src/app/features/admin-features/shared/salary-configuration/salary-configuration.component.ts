import { Component, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { ButtonType } from "../breadcrumb-nav-bar/breadcrumb-nav-bar.component";
import { UserService } from "@core/services/userService";
import { Role } from "@core/types/enums/role";
import { User } from "@core/types/user";
import { SelectOption } from "@core/types/selectOption";
import { SnackBarService } from "@core/services/snackBarService";
import { TranslateService } from "@ngx-translate/core";
import { InstructorClassDetails } from "@core/types/instructors/instructorClassDetails";
import { Class } from "@core/types/classes/class";
import { Assignment } from "@core/types/assignment";
import { AssignmentService } from "@core/services/assignmentService";
import { Currency } from "@core/types/enums/currency";
import { TextInputType } from "@core/types/enums/textInputType";
import { forkJoin } from "rxjs";

type AssignmentWithClass = { class: Class; assignment: Assignment };

@Component({
  selector: 'app-salary-configuration',
  templateUrl: './salary-configuration.component.html',
  styleUrls: ['./salary-configuration.component.scss']
})
export class SalaryConfigurationComponent implements OnInit {
  ButtonType = ButtonType
  readonly TextInputType = TextInputType
  instructorForm: FormGroup
  instructorOptions: SelectOption[] = []
  selectedInstructorId: string = ''
  assignmentInfo: AssignmentWithClass[] = []
  activeAssignments: AssignmentWithClass[] = []

  showPaymentModal = false
  paymentModalButtons = [
    { text: 'CONTROLS.CANCEL' },
    { text: 'SALARY_CONFIGURATION.APPLY' }
  ]
  selectedAssignmentForPayment: AssignmentWithClass | null = null
  paymentForm: FormGroup
  applyToAllAssignments = false

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private snackBarService: SnackBarService,
    private assignmentService: AssignmentService,
    private translateService: TranslateService
  ) {
    this.instructorForm = this.fb.group({
      instructor: ['']
    })

    this.paymentForm = this.fb.group({
      paymentValue: ['', [Validators.required, Validators.min(0)]]
    })

    this.instructorForm.get('instructor')?.valueChanges.subscribe(value => {
      this.selectedInstructorId = value || ''
      this._loadAssignments()
    })
  }

  ngOnInit(): void {
    this._loadInstructors()
  }

  private _loadInstructors(): void {
    this.userService.getAllUsers(Role.INSTRUCTOR).subscribe({
      next: (instructors: User[]) => {
        instructors.sort((a: User, b: User) => {
          if (a.firstName < b.firstName) return -1
          if (b.firstName < a.firstName) return 1
          if (a.lastName < b.lastName) return -1
          if (b.lastName < a.lastName) return 1
          return 0
        })

        this.instructorOptions = instructors.map((instructor: User) => ({
          value: instructor._id,
          viewValue: `${instructor.firstName} ${instructor.lastName}`
        }))
      },
      error: ({error}) => {
        this.snackBarService.showError(error.message)
      }
    })
  }

  private _loadAssignments(): void {
    this.assignmentInfo = []
    this.activeAssignments = []

    if (!this.selectedInstructorId) return

    this.userService.getInstructorClassDetails(this.selectedInstructorId).subscribe({
      next: (details: InstructorClassDetails) => {
        this.assignmentInfo = details.assignmentInfo ?? []
        this._filterActiveAssignments()
      },
      error: ({error}) => {
        this.snackBarService.showError(error.message)
      }
    })
  }

  private _filterActiveAssignments(): void {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    this.activeAssignments = this.assignmentInfo.filter((item) => {
      if (item.assignment.endDate) {
        const end = new Date(item.assignment.endDate)
        end.setHours(0, 0, 0, 0)
        if (end < today) return false
      }
      if (item.class.endDate) {
        const classEnd = new Date(item.class.endDate)
        classEnd.setHours(0, 0, 0, 0)
        if (classEnd < today) return false
      }
      return true
    })
  }

  openPaymentModal(item: AssignmentWithClass): void {
    this.selectedAssignmentForPayment = item
    this.applyToAllAssignments = false
    const current = item.assignment.paymentValue?.amount
    this.paymentForm.reset({
      paymentValue: current != null ? String(current) : ''
    })
    this.showPaymentModal = true
  }

  processPaymentModalClick(event: { buttonTitle: string }): void {
    if (event.buttonTitle === 'CONTROLS.CANCEL' || event.buttonTitle === 'close-button') {
      this.showPaymentModal = false
      this.selectedAssignmentForPayment = null
      this.paymentForm.reset()
      return
    }

    if (event.buttonTitle !== 'SALARY_CONFIGURATION.APPLY') return

    const raw = this.paymentForm.get('paymentValue')?.value
    const amount = typeof raw === 'string' ? parseFloat(raw) : Number(raw)
    if (isNaN(amount) || amount < 0) {
      this.snackBarService.showError(this.translateService.instant('SALARY_CONFIGURATION.ENTER_VALID_NUMBER'))
      return
    }

    const paymentValue = { amount, currency: Currency.PESOS as Currency }

    if (this.applyToAllAssignments && this.selectedInstructorId) {
      const updates = this.activeAssignments.map((a) =>
        this.assignmentService.updateAssignment(a.assignment._id, { paymentValue })
      )
      forkJoin(updates).subscribe({
        next: () => {
          this.snackBarService.showSuccess(this.translateService.instant('SALARY_CONFIGURATION.APPLY_SUCCESS_ALL'))
          this.showPaymentModal = false
          this.selectedAssignmentForPayment = null
          this._loadAssignments()
        },
        error: ({ error }) => this.snackBarService.showError(error?.message || this.translateService.instant('SALARY_CONFIGURATION.APPLY_ERROR'))
      })
    } else if (this.selectedAssignmentForPayment) {
      this.assignmentService
        .updateAssignment(this.selectedAssignmentForPayment.assignment._id, { paymentValue })
        .subscribe({
          next: () => {
            this.snackBarService.showSuccess(this.translateService.instant('SALARY_CONFIGURATION.APPLY_SUCCESS'))
            this.showPaymentModal = false
            this.selectedAssignmentForPayment = null
            this._loadAssignments()
          },
          error: ({ error }) => this.snackBarService.showError(error?.message || this.translateService.instant('SALARY_CONFIGURATION.APPLY_ERROR'))
        })
    }
  }

  getPaymentDisplay(item: AssignmentWithClass): string {
    const p = item.assignment.paymentValue
    if (!p || p.amount == null) return '0 MXN'
    return `${p.amount} ${p.currency || 'MXN'}`
  }

  /** Estimated monthly salary: sum over assignments of (payment per session × sessions per month). Sessions per month = 4 × days per week (e.g. Mon/Wed/Fri → 12, Sat only → 4). */
  get estimatedMonthlySalaryDisplay(): string {
    const SESSIONS_MULTIPLIER = 4
    const sum = this.activeAssignments.reduce((acc, item) => {
      const payment = item.assignment.paymentValue?.amount
      const amount = typeof payment === 'number' && !isNaN(payment) ? payment : 0
      const daysPerWeek = Array.isArray(item.class.days) ? item.class.days.length : 0
      const sessionsPerMonth = daysPerWeek * SESSIONS_MULTIPLIER
      return acc + amount * sessionsPerMonth
    }, 0)
    return `${Math.round(sum)} MXN`
  }

  /** Group by location first, then class type; each group holds the list of assignments (days/times). */
  get assignmentsGroupedByLocationThenType(): Map<string, Map<string, AssignmentWithClass[]>> {
    const result = new Map<string, Map<string, AssignmentWithClass[]>>()
    for (const item of this.activeAssignments) {
      const loc = item.class.classLocation
      const typeKey = item.class.classType
      if (!result.has(loc)) {
        result.set(loc, new Map<string, AssignmentWithClass[]>())
      }
      const typeMap = result.get(loc)!
      const list = typeMap.get(typeKey) || []
      list.push(item)
      typeMap.set(typeKey, list)
    }
    return result
  }
}
