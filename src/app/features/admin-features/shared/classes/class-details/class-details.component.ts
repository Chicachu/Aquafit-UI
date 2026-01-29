import { Component, OnInit } from "@angular/core";
import { ClassService } from "@/core/services/classService";
import { UserService } from "@/core/services/userService";
import { ActivatedRoute, Router } from "@angular/router";
import { ClassDetails } from "@/core/types/classes/classDetails";
import { SnackBarService } from "@/core/services/snackBarService";
import { ButtonType } from "../../breadcrumb-nav-bar/breadcrumb-nav-bar.component";
import { PaymentStatus } from "@/core/types/enums/paymentStatus";
import { ClassClientEnrollmentDetails } from "@/core/types/classes/classClientEnrollmentDetails";
import { AbstractControl, FormBuilder, FormGroup, ValidationErrors, ValidatorFn, Validators } from "@angular/forms";
import { EnrollmentService } from "@/core/services/enrollmentService";
import { TranslateService } from "@ngx-translate/core";
import { DatePipe } from "@angular/common";
import { User } from "@/core/types/user";
import { Role } from "@/core/types/enums/role";
import { SelectOption } from "@/core/types/selectOption";
import { BillingFrequency } from "@/core/types/enums/billingFrequency";
import { Weekday } from "@/core/types/enums/weekday";
import { Class } from "@/core/types/classes/class";
import { Note } from "@/core/types/user";

@Component({
  selector: 'app-class-details',
  templateUrl: './class-details.component.html',
  styleUrls: ['./class-details.component.scss']
})
export class ClassDetailsComponent implements OnInit {
  ButtonType = ButtonType
  PaymentStatus = PaymentStatus
  classDetails: ClassDetails | null = null 
  navBarInfo: string[] = []
  clientsByPaymentStatus: Map<PaymentStatus, ClassClientEnrollmentDetails[] | []> = new Map()
  loading = false
  classId: string | null = null
  canEditClass = false
  isTerminated = false
  showEnrollmentModal = false
  showTerminateConfirmationModal = false
  showCancelConfirmationModal = false
  get enrollmentButtons() {
    return this.clientOptions.length > 0 
      ? [{text: 'CONTROLS.CANCEL'}, {text: 'CLIENTS.ENROLL'}]
      : [{text: 'CONTROLS.CANCEL'}]
  }
  get cancelButtons() {
    return [
      {text: 'CONTROLS.CANCEL'}, 
      {text: 'CLASSES.CONFIRM_CANCEL', disabled: !this.cancelForm.valid}
    ]
  }
  enrollmentForm: FormGroup
  terminateForm: FormGroup
  cancelForm: FormGroup
  availableClients: User[] = []
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
  minTerminationDate: Date = new Date()
  paymentStatusConfig: Partial<{
    [key in PaymentStatus]: {
      titleKey: string
      headingClass: string
      iconClass?: string
    }
  }> = {
    [PaymentStatus.PAID]: {
      titleKey: 'PAYMENT_STATUS.PAID',
      headingClass: 'primary-green',
      iconClass: 'paid-status-icon'
    },
    [PaymentStatus.PENDING]: {
      titleKey: 'PAYMENT_STATUS.PENDING',
      headingClass: 'mid-green'
    },
    [PaymentStatus.ALMOST_DUE]: {
      titleKey: 'PAYMENT_STATUS.ALMOST_DUE',
      headingClass: 'yellow',
      iconClass: 'almost-due-status-icon'
    },
    [PaymentStatus.OVERDUE]: {
      titleKey: 'PAYMENT_STATUS.OVERDUE',
      headingClass: 'red',
      iconClass: 'overdue-status-icon'
    }
  }
  readonly visibleStatuses = Object.keys(this.paymentStatusConfig) as PaymentStatus[]
  
  constructor(
    private classService: ClassService, 
    public userService: UserService,
    private route: ActivatedRoute,
    private router: Router,
    private snackBarService: SnackBarService,
    private fb: FormBuilder,
    private enrollmentService: EnrollmentService,
    private translateService: TranslateService
  ) {
    this.enrollmentForm = this.fb.group({
      client: ['', [Validators.required]],
      start_date: ['', [Validators.required]],
      days_override: [null, []],
      billing_frequency_override: [null, []]
    })

    // Initialize terminate form with today's date
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    this.minTerminationDate = today
    this.terminateForm = this.fb.group({
      end_date: [today, [Validators.required, this._minDateValidator(today)]]
    })

    // Initialize cancel form with today's date (no min date restriction - can select past dates)
    this.cancelForm = this.fb.group({
      cancellation_date: [today, [Validators.required]],
      reason: ['', [Validators.required]]
    })
  }

  private _minDateValidator(minDate: Date): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) {
        return null // Don't validate empty values (required validator handles that)
      }
      
      const selectedDate = new Date(control.value._d || control.value)
      selectedDate.setHours(0, 0, 0, 0)
      const min = new Date(minDate)
      min.setHours(0, 0, 0, 0)
      
      if (selectedDate < min) {
        return { minDate: { minDate, actualDate: selectedDate } }
      }
      
      return null
    }
  }

  ngOnInit(): void {
    this.classId = this.route.snapshot.paramMap.get('class-id')
    this.classService.getClassDetails(this.classId!).subscribe({
      next: (classDetails: ClassDetails) => {
        this.classDetails = classDetails
        this.clientsByPaymentStatus.clear()
        this._separateClientsByPaymentStatus(classDetails)
        
        // Check if class is terminated (has endDate today or in the past)
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        if (classDetails.endDate) {
          const endDate = new Date(classDetails.endDate)
          endDate.setHours(0, 0, 0, 0)
          this.isTerminated = endDate <= today
        } else {
          this.isTerminated = false
        }
        
        // Only allow editing if user is admin AND class is not terminated
        this.canEditClass = this.userService.isAdmin && !this.isTerminated
      },
      error: ({error}) => {
        this.snackBarService.showError(error.message)
      }
    })
  }

  addClientToClass(): void {
    if (!this.classDetails) return

    // Fetch all clients
    this.userService.getAllUsers(Role.CLIENT).subscribe({
      next: (allClients: User[]) => {
        // Get IDs of already enrolled clients (including waitlist)
        const enrolledClientIds = new Set<string>()
        this.classDetails!.clients.forEach(client => {
          enrolledClientIds.add(client._id)
        })
        if (this.classDetails!.waitlistClients) {
          this.classDetails!.waitlistClients.forEach(client => {
            enrolledClientIds.add(client._id)
          })
        }

        // Filter out enrolled clients
        this.availableClients = allClients.filter(client => !enrolledClientIds.has(client._id))
        
        // Create options for dropdown
        this.clientOptions = this.availableClients.map(client => ({
          value: client._id,
          viewValue: `${client.firstName} ${client.lastName}`
        }))

        // Load class details for advanced options
        if (this.classId) {
          this.classService.getClassDetails(this.classId).subscribe({
            next: (classInfo: Class) => {
              this.advancedOptionsClassInfo = classInfo
              this.disabledDaysChips = Object.values(Weekday)
                .filter(value => typeof value === 'number')
                .filter(value => !this.advancedOptionsClassInfo?.days.includes(value))
            },
            error: ({error}) => {
              this.snackBarService.showError(error.message)
            }
          })
        }

        this.showEnrollmentModal = true
      },
      error: ({error}) => {
        this.snackBarService.showError(error.message)
      }
    })
  }

  processEnrollmentModalClick(event: { ref: ClassDetailsComponent, buttonTitle: string }): void {
    if (event.buttonTitle === 'CONTROLS.CANCEL' || event.buttonTitle === 'close-button') {
      this.enrollmentForm.reset()
      this.showEnrollmentModal = false
    } else if (event.buttonTitle === 'CLIENTS.ENROLL') {
      if (!this.enrollmentForm.valid || !this.classId) {
        this.snackBarService.showError('Please fill in all required fields')
        return
      }

      const clientId = this.enrollmentForm.controls['client'].value
      const startDate = this.enrollmentForm.controls['start_date'].value._d
      const billingFrequency = this.enrollmentForm.controls['billing_frequency_override'].value ?? null
      const daysOverride = this.enrollmentForm.controls['days_override'].value ?? null

      this.enrollmentService.enrollClient(this.classId, clientId, startDate, billingFrequency, daysOverride).subscribe({
        next: () => {
          // Reload class details
          this.ngOnInit()
          this.snackBarService.showSuccess(this.translateService.instant('CLASSES.ADD_NEW_CLASS_SUCCESS'))
          this.enrollmentForm.reset()
          this.showEnrollmentModal = false
        },
        error: ({error}) => {
          this.snackBarService.showError(error.message)
        }
      })
    }
  }

  onAdvancedOptionsOpened(): void {
    // Class info is already loaded in addClientToClass
    // This method is kept for consistency with client-details component
  }

  cancelClass(): void {
    if (!this.classId || !this.classDetails) return
    
    // Find the next available date that matches class days and isn't already cancelled
    const initialDate = this._findNextAvailableCancellationDate()
    this.cancelForm.patchValue({ cancellation_date: initialDate })
    this.showCancelConfirmationModal = true
  }

  private _findNextAvailableCancellationDate(): Date {
    if (!this.classDetails) {
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      return today
    }

    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const classDays = this.classDetails.days || []
    const cancellations = this.classDetails.cancellations || []
    
    // Helper to check if a date is cancelled
    const isCancelled = (date: Date): boolean => {
      const dateStr = date.getTime()
      return cancellations.some(cancellation => {
        const cancellationDate = new Date(cancellation.date)
        cancellationDate.setHours(0, 0, 0, 0)
        return cancellationDate.getTime() === dateStr
      })
    }

    // Helper to check if a date matches class days
    const matchesClassDays = (date: Date): boolean => {
      return classDays.includes(date.getDay())
    }

    // Start from today and look forward up to 30 days
    let checkDate = new Date(today)
    for (let i = 0; i < 30; i++) {
      if (matchesClassDays(checkDate) && !isCancelled(checkDate)) {
        return checkDate
      }
      checkDate = new Date(checkDate)
      checkDate.setDate(checkDate.getDate() + 1)
      checkDate.setHours(0, 0, 0, 0)
    }

    // If no available date found in next 30 days, return today anyway
    return today
  }

  confirmCancelClass(): void {
    if (!this.classId || !this.cancelForm.valid) return

    const cancellationDate = this.cancelForm.controls['cancellation_date'].value._d || this.cancelForm.controls['cancellation_date'].value
    const reason = this.cancelForm.controls['reason'].value?.trim()
    
    if (!reason) {
      this.snackBarService.showError('Reason is required')
      return
    }

    this.loading = true
    this.showCancelConfirmationModal = false
    this.classService.cancelClass(this.classId, cancellationDate).subscribe({
      next: () => {
        // Format the cancellation date for the note using locale-aware formatting
        const locale = this.translateService.currentLang || 'en'
        const datePipe = new DatePipe(locale)
        const dateStr = datePipe.transform(cancellationDate, 'shortDate') || new Date(cancellationDate).toLocaleDateString()
        const prefix = this.translateService.instant('CLASSES.CANCELLATION_REASON_PREFIX')
        const noteContent = `${prefix} ${dateStr}: ${reason}`
        
        // Add the reason as a note
        this.classService.addNote(this.classId!, noteContent).subscribe({
          next: () => {
            this.snackBarService.showSuccess(this.translateService.instant('CLASSES.CLASS_CANCELLED_SUCCESS'))
            // Reload class details
            this.ngOnInit()
            this.loading = false
          },
          error: ({error}) => {
            // Even if note fails, cancellation succeeded
            this.snackBarService.showSuccess(this.translateService.instant('CLASSES.CLASS_CANCELLED_SUCCESS'))
            this.snackBarService.showError('Note could not be added: ' + error.message)
            this.ngOnInit()
            this.loading = false
          }
        })
      },
      error: ({error}) => {
        this.snackBarService.showError(error.message)
        this.loading = false
      }
    })
  }

  cancelCancelClass(): void {
    this.showCancelConfirmationModal = false
    // Reset form to today's date when canceling
    const today = new Date()
    this.cancelForm.patchValue({ cancellation_date: today, reason: '' })
  }

  processCancelConfirmationModalClick(event: { ref: ClassDetailsComponent, buttonTitle: string }): void {
    if (event.buttonTitle === 'CONTROLS.CANCEL' || event.buttonTitle === 'close-button') {
      this.cancelCancelClass()
    } else if (event.buttonTitle === 'CLASSES.CONFIRM_CANCEL') {
      this.confirmCancelClass()
    }
  }

  terminateClass(): void {
    if (!this.classId || !this.canEditClass) return
    // Reset form to today's date when opening modal
    const today = new Date()
    this.terminateForm.patchValue({ end_date: today })
    this.showTerminateConfirmationModal = true
  }

  confirmTerminateClass(): void {
    if (!this.classId || !this.canEditClass || !this.terminateForm.valid) return

    const endDate = this.terminateForm.controls['end_date'].value._d || this.terminateForm.controls['end_date'].value
    this.loading = true
    this.showTerminateConfirmationModal = false
    this.classService.terminateClass(this.classId, endDate).subscribe({
      next: () => {
        this.snackBarService.showSuccess(this.translateService.instant('CLASSES.CLASS_TERMINATED_SUCCESS'))
        // Reload class details
        this.ngOnInit()
        this.loading = false
      },
      error: ({error}) => {
        this.snackBarService.showError(error.message)
        this.loading = false
      }
    })
  }

  cancelTerminateClass(): void {
    this.showTerminateConfirmationModal = false
    // Reset form to today's date when canceling
    const today = new Date()
    this.terminateForm.patchValue({ end_date: today })
  }

  processTerminateConfirmationModalClick(event: { ref: ClassDetailsComponent, buttonTitle: string }): void {
    if (event.buttonTitle === 'CONTROLS.CANCEL' || event.buttonTitle === 'close-button') {
      this.cancelTerminateClass()
    } else if (event.buttonTitle === 'CLASSES.CONFIRM_TERMINATE') {
      this.confirmTerminateClass()
    }
  }

  public getStatusSectionClass(status: PaymentStatus): string {
    const cleanStatus = status.toLowerCase().replace(/[\s_]+/g, '-')
    return status === PaymentStatus.PENDING
      ? 'pending-status-section'
      : `flex-row ${cleanStatus}-status-section`
  }
  
  editClass(): void {
    if (this.classId && this.canEditClass) {
      this.router.navigate(['../edit'], { relativeTo: this.route })
    }
  }

  private _separateClientsByPaymentStatus(classDetails: ClassDetails): void {
    classDetails.clients.forEach((client) => {
      const group = this.clientsByPaymentStatus.get(client.currentPayment.paymentStatus) || []

      group.push(client)

      this.clientsByPaymentStatus.set(client.currentPayment.paymentStatus, group)
    })
  }

  get cancelledDates(): Date[] {
    if (!this.classDetails?.cancellations) {
      return []
    }
    return this.classDetails.cancellations.map(cancellation => new Date(cancellation.date))
  }

  onNotesUpdated(notes: Note[]): void {
    if (this.classDetails) {
      this.classDetails.notes = notes
    }
  }
}