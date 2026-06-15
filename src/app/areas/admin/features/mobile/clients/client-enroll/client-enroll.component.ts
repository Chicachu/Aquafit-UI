import { Component, EventEmitter, HostBinding, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ClassService } from '@core/services/classService';
import { EnrollmentService } from '@core/services/enrollmentService';
import { SnackBarService } from '@core/services/snackBarService';
import { TranslateService } from '@ngx-translate/core';
import { ClassScheduleMap } from '@core/types/classScheduleMap';
import { ClassType } from '@core/types/enums/classType';
import { BillingFrequency } from '@core/types/enums/billingFrequency';
import { Weekday } from '@core/types/enums/weekday';
import { EnrollmentStatus } from '@core/types/enums/enrollmentStatus';
import { SelectOption } from '@core/types/selectOption';
import { User } from '@core/types/user';
import { Class } from '@core/types/classes/class';
import { Enrollment } from '@core/types/enrollment';

@Component({
  selector: 'app-client-enroll',
  templateUrl: './client-enroll.component.html',
  styleUrls: ['./client-enroll.component.scss']
})
export class ClientEnrollComponent implements OnInit, OnChanges {
  @Input() userId: string | null = null
  @Input() @HostBinding('class.panel-view') panelView = false
  @Output() closed = new EventEmitter<void>()
  @Output() enrolled = new EventEmitter<void>()

  client: User | null = null
  enrollmentForm: FormGroup
  classTypeOptions: SelectOption[] = []
  classLocationOptions: SelectOption[] = []
  classTimesOptions: SelectOption[] = []
  classScheduleMap: ClassScheduleMap | null = null
  selectedType: ClassType | null = null
  selectedLocation = ''
  selectedClassId = ''
  classEnrollmentInfo: { class: Class, enrollment: Enrollment }[] = []
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
  loading = false

  constructor(
    private classService: ClassService,
    private enrollmentService: EnrollmentService,
    private snackBarService: SnackBarService,
    private translateService: TranslateService,
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.enrollmentForm = this.fb.group({
      class_type: ['', [Validators.required]],
      location: ['', [Validators.required]],
      time: ['', [Validators.required]],
      start_date: ['', [Validators.required]],
      days_override: [null, []],
      billing_frequency_override: [null, []]
    })
  }

  ngOnInit(): void {
    if (this.route.snapshot.data['panelView'] === true) {
      this.panelView = true
    }

    this._setupFormSubscriptions()

    if (this.userId) {
      this._loadEnrollmentData()
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['userId'] && this.userId) {
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
    if (!this.enrollmentForm.valid || !this.userId || !this.selectedClassId) {
      this.enrollmentForm.markAllAsTouched()
      this.snackBarService.showError(this.translateService.instant('ERRORS.FILL_REQUIRED_FIELDS'))
      return
    }

    const billingFrequency = this._getBillingFrequencyOverride()
    const daysOverride = this.enrollmentForm.controls['days_override'].value ?? null
    const startDate = this.enrollmentForm.controls['start_date'].value._d

    this.loading = true
    this.enrollmentService.enrollClient(this.selectedClassId, this.userId, startDate, billingFrequency, daysOverride).subscribe({
      next: () => {
        this.loading = false
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

  onAdvancedOptionsOpened(): void {
    if (!this.selectedClassId) {
      return
    }

    if (this.advancedOptionsClassInfo?._id === this.selectedClassId) {
      return
    }

    this._loadSelectedClassInfo()
  }

  private _loadSelectedClassInfo(): void {
    if (!this.selectedClassId) {
      this.advancedOptionsClassInfo = undefined
      this.disabledDaysChips = []
      return
    }

    this.classService.getClassDetails(this.selectedClassId).subscribe({
      next: (classInfo: Class) => {
        this.advancedOptionsClassInfo = classInfo
        this.disabledDaysChips = Object.values(Weekday)
          .filter(value => typeof value === 'number')
          .filter(value => !classInfo.days.includes(value))
      },
      error: ({ error }) => {
        this.snackBarService.showError(error.message)
      }
    })
  }

  private _loadEnrollmentData(): void {
    if (!this.userId) {
      return
    }

    this.enrollmentService.getClientEnrollmentDetails(this.userId).subscribe({
      next: ({ client, enrolledClassInfo }) => {
        this.client = client
        this.classEnrollmentInfo = enrolledClassInfo
        this._loadClassScheduleMap()
      },
      error: ({ error }) => {
        this.snackBarService.showError(error.message)
      }
    })
  }

  private _loadClassScheduleMap(): void {
    this.classService.getClassScheduleMap().subscribe({
      next: (classScheduleMap: ClassScheduleMap) => {
        this.classScheduleMap = classScheduleMap
        this.classTypeOptions = Object.keys(classScheduleMap).map(classType => ({
          viewValue: classType,
          value: classType
        }))
      },
      error: ({ error }) => {
        this.snackBarService.showError(error.message)
      }
    })
  }

  private _setupFormSubscriptions(): void {
    this.enrollmentForm.get('class_type')?.valueChanges.subscribe((selectedClassType: ClassType) => {
      if (!this.classScheduleMap) {
        return
      }

      this.selectedType = selectedClassType
      const locations = Object.keys(this.classScheduleMap[selectedClassType] || {})
      this.classLocationOptions = locations.map(location => ({
        value: location,
        viewValue: location
      }))

      this.selectedLocation = ''
      this.selectedClassId = ''
      this.advancedOptionsClassInfo = undefined
      this.disabledDaysChips = []
      this.enrollmentForm.get('location')?.reset('', { emitEvent: false })
      this.enrollmentForm.get('time')?.reset('', { emitEvent: false })
      this.enrollmentForm.get('start_date')?.reset('', { emitEvent: false })
    })

    this.enrollmentForm.get('location')?.valueChanges.subscribe((selectedLocation: string) => {
      if (!this.classScheduleMap || !this.selectedType) {
        return
      }

      this.selectedLocation = selectedLocation
      const timeMap = this.classScheduleMap[this.selectedType]?.[selectedLocation] || {}
      const activeClassIds = this._getActiveEnrolledClassIds(this.selectedType, selectedLocation)

      this.classTimesOptions = Object.keys(timeMap)
        .filter(timeSlot => !activeClassIds.has(timeMap[timeSlot]))
        .map(timeSlot => ({
          value: timeSlot,
          viewValue: timeSlot
        }))

      this.selectedClassId = ''
      this.advancedOptionsClassInfo = undefined
      this.disabledDaysChips = []
      this.enrollmentForm.get('time')?.reset('', { emitEvent: false })
      this.enrollmentForm.get('start_date')?.reset('', { emitEvent: false })
    })

    this.enrollmentForm.get('time')?.valueChanges.subscribe((selectedTime: string) => {
      if (!this.classScheduleMap || !this.selectedType || !this.selectedLocation) {
        return
      }

      this.selectedClassId = this.classScheduleMap[this.selectedType]?.[this.selectedLocation]?.[selectedTime] ?? ''
      this.enrollmentForm.get('start_date')?.reset('', { emitEvent: false })
      this._loadSelectedClassInfo()
    })
  }

  private _getActiveEnrolledClassIds(classType: ClassType, location: string): Set<string> {
    const activeClassIds = new Set<string>()
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    this.classEnrollmentInfo.forEach(item => {
      if (item.class.classType !== classType || item.class.classLocation !== location) {
        return
      }

      const isActive = item.enrollment.status === EnrollmentStatus.ACTIVE
      if (!isActive) {
        return
      }

      if (item.enrollment.endDate) {
        const enrollmentEndDate = new Date(item.enrollment.endDate)
        enrollmentEndDate.setHours(0, 0, 0, 0)
        const yesterday = new Date(today)
        yesterday.setDate(yesterday.getDate() - 1)

        if (enrollmentEndDate <= yesterday) {
          return
        }
      }

      activeClassIds.add(item.class._id)
    })

    return activeClassIds
  }

  private _resetForm(): void {
    this.enrollmentForm.reset({
      class_type: '',
      location: '',
      time: '',
      start_date: '',
      days_override: null,
      billing_frequency_override: null
    })
    this.selectedType = null
    this.selectedLocation = ''
    this.selectedClassId = ''
    this.classLocationOptions = []
    this.classTimesOptions = []
    this.advancedOptionsClassInfo = undefined
    this.disabledDaysChips = []
  }

  private _getBillingFrequencyOverride(): BillingFrequency | null {
    const value = this.enrollmentForm.controls['billing_frequency_override'].value
    if (value === null || value === undefined || value === '') {
      return null
    }

    return value
  }

  private _closePanelRoute(): void {
    if (!this.userId) {
      return
    }

    this.router.navigate(['/admin/clients', this.userId, 'details'])
  }
}
