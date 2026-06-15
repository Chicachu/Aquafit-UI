import { Component, HostBinding, Input, OnDestroy, OnInit } from "@angular/core";
import { ClassService } from "@/core/services/classService";
import { UserService } from "@/core/services/userService";
import { ActivatedRoute, NavigationEnd, Router } from "@angular/router";
import { ClassDetails } from "@/core/types/classes/classDetails";
import { SnackBarService } from "@/core/services/snackBarService";
import { ButtonType } from "../../breadcrumb-nav-bar/breadcrumb-nav-bar.component";
import { PaymentStatus } from "@/core/types/enums/paymentStatus";
import { ClassClientEnrollmentDetails } from "@/core/types/classes/classClientEnrollmentDetails";
import { AbstractControl, FormBuilder, FormGroup, ValidationErrors, ValidatorFn, Validators } from "@angular/forms";
import { TranslateService } from "@ngx-translate/core";
import { DatePipe } from "@angular/common";
import { User } from "@/core/types/user";
import { Role } from "@/core/types/enums/role";
import { Weekday } from "@/core/types/enums/weekday";
import { ClassType } from "@/core/types/enums/classType";
import { Note } from "@/core/types/user";
import { WaitlistService, WaitlistEntry, CreateWaitlistEntryDTO } from "@/core/services/waitlistService";
import { forkJoin } from "rxjs";
import { debounceTime, distinctUntilChanged, filter, map } from "rxjs/operators";
import { CacheService } from "@/core/services/cacheService";
import { Subscription } from "rxjs";

@Component({
  selector: 'app-class-details',
  templateUrl: './class-details.component.html',
  styleUrls: ['./class-details.component.scss']
})
export class ClassDetailsComponent implements OnInit, OnDestroy {
  @Input() showBreadcrumb = true
  @Input() @HostBinding('class.panel-view') panelView = false

  ButtonType = ButtonType
  PaymentStatus = PaymentStatus
  Role = Role

  get canAddToWaitlist(): boolean {
    return !this.isTerminated && (this.userService.isAdmin || this.userService.isManager || this.userService.isReceptionist || this.userService.userRole === Role.INSTRUCTOR)
  }

  get canCancelClass(): boolean {
    return !this.isTerminated && (this.userService.isAdmin || this.userService.isManager || this.userService.isReceptionist || this.userService.userRole === Role.INSTRUCTOR)
  }

  get canTerminateClass(): boolean {
    return !this.isTerminated && (this.userService.isAdmin || this.userService.isManager)
  }

  get canEnrollClientToClass(): boolean {
    return !this.isTerminated && (this.userService.isAdmin || this.userService.isManager || this.userService.isReceptionist || this.userService.userRole === Role.INSTRUCTOR)
  }

  get canViewPaymentsInClass(): boolean {
    return this.userService.isAdmin || this.userService.isManager || this.userService.isReceptionist
  }

  get canLinkToEmployeeDetails(): boolean {
    return this.userService.isAdmin || this.userService.isManager
  }

  getEmployeeDetailsLink(employeeId: string): string[] {
    return this.panelView
      ? ['/admin/employees', employeeId, 'details']
      : ['/admin/mobile/employees', employeeId, 'details']
  }

  canShowClientInvoiceLink(client: ClassClientEnrollmentDetails): boolean {
    return this.canViewPaymentsInClass
      && !!this.getClientEnrollmentId(client)
  }

  getClientEnrollmentId(client: ClassClientEnrollmentDetails): string | null {
    return client.enrollmentId || client.currentPayment?.enrollmentId || null
  }

  getClientInvoiceId(client: ClassClientEnrollmentDetails): string | null {
    return client.currentPayment?._id ?? null
  }

  get hasEnrolledClients(): boolean {
    return (this.classDetails?.clients?.length ?? 0) > 0
  }

  /** True when class is Private Fitness (show Instructor/Client radio in cancel modal) */
  get isPrivateFitnessClass(): boolean {
    return this.classDetails?.classType === ClassType.PRIVATE_FITNESS
  }

  classDetails: ClassDetails | null = null
  navBarInfo: string[] = []
  private routeSubscription?: Subscription
  private routerSubscription?: Subscription
  clientsGroupedByStatus: { status: PaymentStatus; clients: ClassClientEnrollmentDetails[] }[] = []
  loading = false
  classId: string | null = null
  canEditClass = false
  isTerminated = false
  showEnrollmentModal = false
  showTerminateConfirmationModal = false
  showCancelConfirmationModal = false
  showWaitlistModal = false
  waitlistEntries: WaitlistEntry[] = []
  waitlistUsers: Map<string, User> = new Map() // userId -> User
  waitlistForm: FormGroup
  get isClassFull(): boolean {
    if (!this.classDetails || !this.classDetails.enrollmentCounts || !this.classDetails.days) return false
    
    // Check if ALL days have reached max capacity
    for (const day of this.classDetails.days) {
      const count = this.classDetails.enrollmentCounts[day] || 0
      if (count < this.classDetails.maxCapacity) {
        return false // At least one day has space
      }
    }
    return true // All days are full
  }

  get availableDays(): Weekday[] {
    if (!this.classDetails || !this.classDetails.enrollmentCounts || !this.classDetails.days) return []
    
    return this.classDetails.days.filter(day => {
      const count = this.classDetails!.enrollmentCounts[day] || 0
      return count < this.classDetails!.maxCapacity
    })
  }

  get hasAvailableSpace(): boolean {
    return this.availableDays.length > 0
  }

  getFormattedAvailableDays(): string {
    if (!this.availableDays || this.availableDays.length === 0) return ''
    
    if (this.availableDays.length === 1) {
      return this.availableDays.map(day => this.translateService.instant(`WEEKDAYS_SHORT.${Weekday[day]}`)).join('')
    }
    
    // Format with "&" before the last day
    const dayNames = this.availableDays.map(day => this.translateService.instant(`WEEKDAYS_SHORT.${Weekday[day]}`))
    const lastDay = dayNames.pop()
    return dayNames.join(', ') + ' & ' + lastDay
  }

  get cancelButtons() {
    return [
      {text: 'CONTROLS.CANCEL'}, 
      {text: 'CLASSES.CONFIRM_CANCEL', disabled: !this.cancelForm.valid}
    ]
  }
  terminateForm: FormGroup
  cancelForm: FormGroup
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
    private translateService: TranslateService,
    private waitlistService: WaitlistService,
    private cacheService: CacheService
  ) {
    // Initialize terminate form with today's date
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    this.minTerminationDate = today
    this.terminateForm = this.fb.group({
      end_date: [today, [Validators.required, this._minDateValidator(today)]]
    })

    // Initialize cancel form with today's date (no min date restriction - can select past dates)
    // cancelled_by only used for Private Fitness; default 'instructor'
    this.cancelForm = this.fb.group({
      cancellation_date: [today, [Validators.required]],
      reason: ['', [Validators.required]],
      cancelled_by: ['instructor', []]
    })

    // Initialize waitlist form
    this.waitlistForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      countryCode: ['+52', Validators.required],
      phoneNumber: ['', Validators.required]
    })
    this._setupWaitlistNameLookup()
  }

  private _setupWaitlistNameLookup(): void {
    this.waitlistForm.valueChanges
      .pipe(
        debounceTime(400),
        distinctUntilChanged((a, b) => a.firstName === b.firstName && a.lastName === b.lastName)
      )
      .subscribe((value) => {
        const first = (value.firstName ?? '').trim()
        const last = (value.lastName ?? '').trim()
        const currentPhone = (value.phoneNumber ?? '').trim()
        if (first.length === 0 || last.length === 0) return
        if (currentPhone.length > 0) return // Only auto-fill when phone is empty
        this.userService.lookupByFirstNameAndLastName(first, last).subscribe({
          next: (res) => {
            if (!res.found || !res.user.phoneNumber) return
            const stored = (res.user.phoneNumber ?? '').trim()
            if (!stored) return
            const match = stored.match(/^(\+\d{1,3})\s?(.*)$/)
            if (match) {
              this.waitlistForm.patchValue(
                { countryCode: match[1], phoneNumber: match[2].replace(/\s/g, ' ').trim() },
                { emitEvent: false }
              )
            } else {
              this.waitlistForm.patchValue({ phoneNumber: stored }, { emitEvent: false })
            }
          }
        })
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
    if (this.route.snapshot.data['panelView'] === true) {
      this.panelView = true
    }

    this.routeSubscription = this._getClassIdRoute().paramMap.pipe(
      map(params => params.get('class-id')),
      distinctUntilChanged()
    ).subscribe(classId => {
      if (!classId) {
        return
      }

      this.classId = classId
      this._loadClassDetails()
    })

    if (this.panelView) {
      this.routerSubscription = this.router.events.pipe(
        filter((event): event is NavigationEnd => event instanceof NavigationEnd)
      ).subscribe(() => {
        if (this.classId) {
          this._loadClassDetails()
        }
      })
    }
  }

  ngOnDestroy(): void {
    this.routeSubscription?.unsubscribe()
    this.routerSubscription?.unsubscribe()
  }

  private _getClassIdRoute(): ActivatedRoute {
    if (this.route.snapshot.paramMap.has('class-id')) {
      return this.route
    }

    if (this.route.parent?.snapshot.paramMap.has('class-id')) {
      return this.route.parent
    }

    return this.route
  }

  private _loadClassDetails(): void {
    if (!this.classId) return
    
    this.classService.getClassDetails(this.classId).subscribe({
      next: (classDetails: ClassDetails) => {
        this.classDetails = classDetails
        this.clientsGroupedByStatus = this._buildClientsGroupedByStatus(classDetails)
        
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
        
        // Only allow editing class details if user is admin AND class is not terminated
        this.canEditClass = this.userService.isAdmin && !this.isTerminated
        
        // Load waitlist entries for this class
        this._loadWaitlistEntries()
      },
      error: ({error}) => {
        this.snackBarService.showError(error.message)
      }
    })
  }

  addClientToClass(): void {
    if (!this.classDetails) return

    if (this.panelView && this.classId) {
      this.router.navigate(['/admin/classes', this.classId, 'details', 'enroll'])
      return
    }

    this.showEnrollmentModal = true
  }

  onEnrollmentModalClick(event: { ref: ClassDetailsComponent, buttonTitle: string }): void {
    if (event.buttonTitle === 'close-button') {
      this.closeEnrollmentModal()
    }
  }

  closeEnrollmentModal(): void {
    this.showEnrollmentModal = false
  }

  onClientEnrolled(): void {
    if (this.classId) {
      this.cacheService.invalidate(`classes:details:${this.classId}`)
    }
    this._loadClassDetails()
    this.showEnrollmentModal = false
  }

  openCancelClassModal(): void {
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

  cancelClass(): void {
    if (!this.classId || !this.cancelForm.valid) return

    const cancellationDate = this.cancelForm.controls['cancellation_date'].value._d || this.cancelForm.controls['cancellation_date'].value
    const reason = this.cancelForm.controls['reason'].value?.trim()
    const cancelledBy = this.isPrivateFitnessClass
      ? (this.cancelForm.controls['cancelled_by'].value as 'instructor' | 'client')
      : undefined

    if (!reason) {
      this.snackBarService.showError('Reason is required')
      return
    }

    this.loading = true
    this.showCancelConfirmationModal = false
    this.classService.cancelClass(this.classId, cancellationDate, cancelledBy, reason).subscribe({
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

  /** Close the cancel-class modal without submitting (user clicked Cancel or X). */
  closeCancelClassModal(): void {
    this.showCancelConfirmationModal = false
    // Reset form to today's date and default cancelled_by when closing
    const today = new Date()
    this.cancelForm.patchValue({ cancellation_date: today, reason: '', cancelled_by: 'instructor' })
  }

  processCancelConfirmationModalClick(event: { ref: ClassDetailsComponent, buttonTitle: string }): void {
    if (event.buttonTitle === 'CONTROLS.CANCEL' || event.buttonTitle === 'close-button') {
      this.closeCancelClassModal()
    } else if (event.buttonTitle === 'CLASSES.CONFIRM_CANCEL') {
      this.cancelClass()
    }
  }

  terminateClass(): void {
    if (!this.classId || !this.canTerminateClass) return
    // Reset form to today's date when opening modal
    const today = new Date()
    this.terminateForm.patchValue({ end_date: today })
    this.showTerminateConfirmationModal = true
  }

  confirmTerminateClass(): void {
    if (!this.classId || !this.canTerminateClass || !this.terminateForm.valid) return

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

  private _buildClientsGroupedByStatus(
    classDetails: ClassDetails
  ): { status: PaymentStatus; clients: ClassClientEnrollmentDetails[] }[] {
    const clientsByStatus = new Map<PaymentStatus, ClassClientEnrollmentDetails[]>()

    for (const client of classDetails.clients ?? []) {
      const status = this._resolveClientPaymentStatus(client)
      const group = clientsByStatus.get(status) ?? []
      group.push(client)
      clientsByStatus.set(status, group)
    }

    return this.visibleStatuses
      .filter((status) => (clientsByStatus.get(status)?.length ?? 0) > 0)
      .map((status) => ({
        status,
        clients: clientsByStatus.get(status)!
      }))
  }

  private _resolveClientPaymentStatus(client: ClassClientEnrollmentDetails): PaymentStatus {
    const rawStatus = client.currentPayment?.paymentStatus
    if (!rawStatus) {
      return PaymentStatus.PENDING
    }

    if (this.paymentStatusConfig[rawStatus as PaymentStatus]) {
      return rawStatus as PaymentStatus
    }

    const normalized = Object.values(PaymentStatus).find(
      (status) => status === rawStatus || status === rawStatus.replace(/_/g, ' ')
    )

    return normalized ?? PaymentStatus.PENDING
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

  openWaitlistModal(): void {
    this.showWaitlistModal = true
  }

  closeWaitlistModal(): void {
    this.showWaitlistModal = false
    this.waitlistForm.reset()
  }

  handleWaitlistModalClick(event: { ref: any, buttonTitle: string }): void {
    const buttonText = event.buttonTitle
    if (buttonText === 'CONTROLS.CANCEL' || buttonText === 'close-button') {
      this.closeWaitlistModal()
    } else if (buttonText === 'CONTROLS.SUBMIT') {
      this.submitWaitlistEntry()
    }
  }

  submitWaitlistEntry(): void {
    if (this.waitlistForm.valid && this.classId) {
      const formValue = this.waitlistForm.value
      const phoneNumber = this._getWaitlistFormPhone(formValue)
      const dto: CreateWaitlistEntryDTO = {
        classId: this.classId,
        firstName: formValue.firstName,
        lastName: formValue.lastName,
        phoneNumber
      }
      this.waitlistService.addWaitlistEntry(dto).subscribe({
        next: () => {
          this.snackBarService.showSuccess('Waitlist entry added successfully')
          this.closeWaitlistModal()
          this._loadWaitlistEntries()
        },
        error: ({ error }) => {
          this.snackBarService.showError(error?.message ?? 'An error occurred')
        }
      })
    } else {
      this.waitlistForm.markAllAsTouched()
    }
  }

  private _getWaitlistFormPhone(formValue: { phoneNumber?: string; countryCode?: string }): string {
    let phoneNumber = formValue.phoneNumber || ''
    if (formValue.countryCode && phoneNumber) {
      phoneNumber = phoneNumber.replace(/^\+\d{1,3}\s?/, '')
      phoneNumber = `${formValue.countryCode} ${phoneNumber}`.trim()
    }
    return phoneNumber
  }

  private _loadWaitlistEntries(): void {
    if (!this.classId) return
    
    this.waitlistService.getAllWaitlistEntries().subscribe({
      next: (entries: WaitlistEntry[]) => {
        // Filter entries for this specific class and sort by createdAt (oldest first)
        const classEntries = entries
          .filter(entry => entry.classId === this.classId)
          .sort((a, b) => {
            const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0
            const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0
            return dateA - dateB
          })
        
        this.waitlistEntries = classEntries
        
        // Load user data for waitlist entries
        const userIds = [...new Set(classEntries.map(e => e.userId))]
        if (userIds.length > 0) {
          forkJoin(userIds.map(id => this.userService.getUser(id))).subscribe({
            next: (users: User[]) => {
              this.waitlistUsers.clear()
              users.forEach(user => {
                if (user) {
                  this.waitlistUsers.set(user._id, user)
                }
              })
            },
            error: ({error}) => {
              this.snackBarService.showError(error.message)
            }
          })
        }
      },
      error: ({error}) => {
        this.snackBarService.showError(error.message)
      }
    })
  }

  get waitlistModalButtons() {
    return [
      { text: 'CONTROLS.CANCEL' },
      { text: 'CONTROLS.SUBMIT', disabled: !this.waitlistForm.valid }
    ]
  }
}