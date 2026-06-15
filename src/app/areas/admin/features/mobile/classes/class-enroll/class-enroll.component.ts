import { Component, EventEmitter, HostBinding, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ClassService } from '@/core/services/classService';
import { UserService } from '@/core/services/userService';
import { EnrollmentService } from '@/core/services/enrollmentService';
import { SnackBarService } from '@/core/services/snackBarService';
import { TranslateService } from '@ngx-translate/core';
import { CacheService } from '@/core/services/cacheService';
import { ClassDetails } from '@/core/types/classes/classDetails';
import { Class } from '@/core/types/classes/class';
import { User } from '@/core/types/user';
import { Role } from '@/core/types/enums/role';
import { SelectOption } from '@/core/types/selectOption';
import { BillingFrequency } from '@/core/types/enums/billingFrequency';
import { Weekday } from '@/core/types/enums/weekday';

@Component({
  selector: 'app-class-enroll',
  templateUrl: './class-enroll.component.html',
  styleUrls: ['./class-enroll.component.scss']
})
export class ClassEnrollComponent implements OnInit, OnChanges {
  @Input() classId: string | null = null
  @Input() @HostBinding('class.panel-view') panelView = false
  @Output() closed = new EventEmitter<void>()
  @Output() enrolled = new EventEmitter<void>()

  classDetails: ClassDetails | null = null
  enrollmentForm: FormGroup
  clientOptions: SelectOption[] = []
  weekdays: SelectOption[] = Object.keys(Weekday)
    .filter(key => isNaN(Number(key)))
    .map(key => ({
      viewValue: key.toUpperCase(),
      value: Weekday[key as keyof typeof Weekday]
    }))
  billingFrequencyOptions: SelectOption[] = Object.keys(BillingFrequency)
    .map(key => ({
      viewValue: key.toUpperCase(),
      value: BillingFrequency[key as keyof typeof BillingFrequency]
    }))
  advancedOptionsClassInfo: Class | undefined
  disabledDaysChips: number[] = []
  autoExpandAdvancedOptions = false
  loading = false

  constructor(
    private classService: ClassService,
    private userService: UserService,
    private enrollmentService: EnrollmentService,
    private snackBarService: SnackBarService,
    private translateService: TranslateService,
    private cacheService: CacheService,
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.enrollmentForm = this.fb.group({
      client: ['', [Validators.required]],
      start_date: ['', [Validators.required]],
      days_override: [null, []],
      billing_frequency_override: [null, []]
    })
  }

  get availableDays(): Weekday[] {
    if (!this.classDetails?.enrollmentCounts || !this.classDetails.days) {
      return []
    }

    return this.classDetails.days.filter(day => {
      const count = this.classDetails!.enrollmentCounts[day] || 0
      return count < this.classDetails!.maxCapacity
    })
  }

  get availableWeekdayOptions(): SelectOption[] {
    if (!this.needsPartialEnrollment) {
      return this.weekdays
    }

    return this.weekdays.filter(option => {
      const dayValue = option.value as Weekday
      return this.availableDays.includes(dayValue)
    })
  }

  get needsPartialEnrollment(): boolean {
    if (!this.classDetails?.enrollmentCounts || !this.classDetails.days) {
      return false
    }

    const hasFullDays = this.classDetails.days.some(day => {
      const count = this.classDetails!.enrollmentCounts[day] || 0
      return count >= this.classDetails!.maxCapacity
    })

    return hasFullDays && this.availableDays.length > 0
  }

  ngOnInit(): void {
    if (this.route.snapshot.data['panelView'] === true) {
      this.panelView = true
    }

    if (this.panelView && this.classId) {
      this._loadEnrollmentData()
      return
    }

    if (!this.panelView && this.classId) {
      this._loadEnrollmentData()
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['classId'] && this.panelView && this.classId) {
      this._loadEnrollmentData()
    }
  }

  cancel(): void {
    this._resetForm()
    if (this.panelView) {
      this._closePanelRoute()
      return
    }

    this.closed.emit()
  }

  submit(): void {
    if (!this.enrollmentForm.valid || !this.classId) {
      this.enrollmentForm.markAllAsTouched()
      this.snackBarService.showError(this.translateService.instant('ERRORS.FILL_REQUIRED_FIELDS'))
      return
    }

    const clientId = this.enrollmentForm.controls['client'].value
    const startDate = this.enrollmentForm.controls['start_date'].value._d
    const billingFrequency = this._getBillingFrequencyOverride()
    const daysOverride = this.enrollmentForm.controls['days_override'].value ?? null

    this.loading = true
    this.enrollmentService.enrollClient(this.classId, clientId, startDate, billingFrequency, daysOverride).subscribe({
      next: () => {
        this.loading = false
        this.cacheService.invalidate(`classes:details:${this.classId}`)
        this.snackBarService.showSuccess(this.translateService.instant('ENROLLMENTS.ADD_NEW_ENROLLMENT_SUCCESS'))
        this._resetForm()
        if (this.panelView) {
          this._closePanelRoute()
        } else {
          this.enrolled.emit()
        }
      },
      error: ({ error }) => {
        this.loading = false
        this.snackBarService.showError(error.message)
      }
    })
  }

  private _loadEnrollmentData(): void {
    if (!this.classId) {
      return
    }

    this.classService.getClassDetails(this.classId).subscribe({
      next: (classDetails: ClassDetails) => {
        this.classDetails = classDetails
        this._loadClientOptions()
        this._setupAdvancedOptions()
      },
      error: ({ error }) => {
        this.snackBarService.showError(error.message)
      }
    })
  }

  private _loadClientOptions(): void {
    if (!this.classDetails) {
      return
    }

    this.userService.getAllUsers(Role.CLIENT).subscribe({
      next: (allClients: User[]) => {
        const enrolledClientIds = new Set<string>()
        this.classDetails!.clients.forEach(client => enrolledClientIds.add(client._id))
        this.classDetails!.waitlistClients?.forEach(client => enrolledClientIds.add(client._id))

        this.clientOptions = allClients
          .filter(client => !enrolledClientIds.has(client._id))
          .map(client => ({
            value: client._id,
            viewValue: `${client.firstName} ${client.lastName}`
          }))
      },
      error: ({ error }) => {
        this.snackBarService.showError(error.message)
      }
    })
  }

  private _setupAdvancedOptions(): void {
    if (!this.classId || !this.classDetails) {
      return
    }

    this.classService.getClass(this.classId).subscribe({
      next: (classInfo: Class) => {
        this.advancedOptionsClassInfo = classInfo

        if (this.needsPartialEnrollment) {
          this.autoExpandAdvancedOptions = true
          this.disabledDaysChips = Object.values(Weekday)
            .filter(value => typeof value === 'number')
            .filter((dayValue: Weekday) => {
              const count = this.classDetails!.enrollmentCounts[dayValue] || 0
              return count >= this.classDetails!.maxCapacity
            })

          const daysOverrideControl = this.enrollmentForm.get('days_override')
          if (daysOverrideControl) {
            daysOverrideControl.setValidators([Validators.required])
            daysOverrideControl.updateValueAndValidity()
          }
        } else {
          this.autoExpandAdvancedOptions = false
          this.disabledDaysChips = Object.values(Weekday)
            .filter(value => typeof value === 'number')
            .filter(value => !this.advancedOptionsClassInfo?.days.includes(value))

          const daysOverrideControl = this.enrollmentForm.get('days_override')
          if (daysOverrideControl) {
            daysOverrideControl.clearValidators()
            daysOverrideControl.updateValueAndValidity()
          }
        }

      },
      error: ({ error }) => {
        this.snackBarService.showError(error.message)
      }
    })
  }

  private _resetForm(): void {
    this.enrollmentForm.reset({
      client: '',
      start_date: '',
      days_override: null,
      billing_frequency_override: null
    })
    this.autoExpandAdvancedOptions = false
  }

  private _getBillingFrequencyOverride(): BillingFrequency | null {
    const value = this.enrollmentForm.controls['billing_frequency_override'].value
    if (value === null || value === undefined || value === '') {
      return null
    }

    return value
  }

  private _closePanelRoute(): void {
    if (!this.classId) {
      return
    }

    this.router.navigate(['/admin/classes', this.classId, 'details'])
  }
}
