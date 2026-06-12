import { ChangeDetectorRef, Component, HostBinding, OnDestroy, OnInit } from "@angular/core";
import { ButtonType } from "../../breadcrumb-nav-bar/breadcrumb-nav-bar.component";
import { ActivatedRoute, Router } from "@angular/router";
import { distinctUntilChanged, map } from "rxjs/operators";
import { forkJoin, Subscription } from "rxjs";
import { UserService } from "@core/services/userService";
import { User } from "@core/types/user";
import { SnackBarService } from "@core/services/snackBarService";
import { ClassService } from "@core/services/classService";
import { SelectOption } from "@core/types/selectOption";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { ClassType } from "@core/types/enums/classType";
import { ClassScheduleMap } from "@core/types/classScheduleMap";
import { FormatOptions } from "@core/types/enums/formatOptions";
import { EnrollmentService } from "@core/services/enrollmentService";
import { BillingFrequency } from "@core/types/enums/billingFrequency";
import { TranslateService } from "@ngx-translate/core";
import { ClientEnrollmentDetails } from "@core/types/clients/clientEnrollmentDetails";
import { Enrollment } from "@core/types/enrollment";
import { Class } from "@core/types/classes/class";
import { Weekday } from "@core/types/enums/weekday";
import { Note } from "@core/types/user";
import { EnrollmentStatus } from "@core/types/enums/enrollmentStatus";
import { Role } from "@core/types/enums/role";
import { WaitlistService, WaitlistEntry } from "@core/services/waitlistService";

@Component({
  selector: 'app-client-details',
  templateUrl: './client-details.component.html',
  styleUrls: ['./client-details.component.scss']
})
export class ClientDetailsComponent implements OnInit, OnDestroy {
  @HostBinding('class.panel-view') panelView = false

  readonly FormatOptions = FormatOptions
  readonly EnrollmentStatus = EnrollmentStatus
  ButtonType = ButtonType
  clientId: string | null = null
  client: User | null = null
  canDeleteUser = false
  showEnrollmentModal = false
  showDeleteUserModal = false
  enrollmentButtons = [{text: 'CONTROLS.CANCEL'}, {text: 'CLIENTS.ENROLL'}]
  showUnenrollModal = false
  unenrollButtons = [{text: 'CONTROLS.CANCEL'}, {text: 'CLIENTS.UNENROLL'}]
  deleteUserButtons = [{text: 'CONTROLS.CANCEL'}, {text: 'CLIENTS.DELETE_USER_CONFIRM_YES'}]
  unenrollForm: FormGroup
  selectedEnrollmentForUnenroll: { class: Class, enrollment: Enrollment } | null = null
  classSelectionForm: FormGroup 
  classTypeOptions: SelectOption[] = []
  selectedType: ClassType | null = null 
  classLocationOptions: SelectOption[] = []
  selectedLocation: string = ''
  classTimesOptions: SelectOption[] = []
  classScheduleMap: ClassScheduleMap | null = null
  selectedClassId: string = ''
  classEnrollmentInfo: { class: Class, enrollment: Enrollment }[] = []
  activeClassEnrollmentInfo: { class: Class, enrollment: Enrollment }[] = []
  unenrolledClassEnrollmentInfo: { class: Class, enrollment: Enrollment }[] = []
  terminatedClassEnrollmentInfo: { class: Class, enrollment: Enrollment }[] = []
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
  waitlistClassInfo: Array<{ classId: string, className: string }> = []
  allClasses: Class[] = []

  private routeSubscription?: Subscription
  constructor(
    private route: ActivatedRoute,
    private userService: UserService, 
    private snackBarService: SnackBarService, 
    private classService: ClassService,
    private fb: FormBuilder,
    private enrollmentService: EnrollmentService,
    private translateService: TranslateService,
    private router: Router,
    private waitlistService: WaitlistService
  ) {
    this.classSelectionForm = this.fb.group({
      class_type: ['', [Validators.required]],
      location: ['', [Validators.required]],
      time: ['', [Validators.required]],
      start_date: ['', [Validators.required]],
      days_override: [null, []],
      billing_frequency_override: [null, []]
    })
    this.unenrollForm = this.fb.group({
      cancelReason: ['']
    })
  }

  get isAdmin(): boolean {
    return this.userService.isAdmin
  }

  get canEditClient(): boolean {
    return this.userService.isAdmin || this.userService.isManager || this.userService.isReceptionist
  }

  get canUnenroll(): boolean {
    return this.userService.isAdmin || this.userService.isManager || this.userService.userRole === Role.INSTRUCTOR
  }

  get canViewClientPayments(): boolean {
    return this.userService.isAdmin || this.userService.isManager || this.userService.isReceptionist
  }

  private _loadCanDeleteUser(): void {
    if (!this.clientId || !this.isAdmin) return
    this.userService.getCanDeleteUser(this.clientId).subscribe({
      next: (res) => {
        this.canDeleteUser = res.canDelete
      }
    })
  }

  openDeleteUserModal(): void {
    this.showDeleteUserModal = true
  }

  processDeleteUserModalClick(event: { ref: ClientDetailsComponent; buttonTitle: string }): void {
    if (event.buttonTitle === 'CONTROLS.CANCEL' || event.buttonTitle === 'close-button') {
      this.showDeleteUserModal = false
    } else if (event.buttonTitle === 'CLIENTS.DELETE_USER_CONFIRM_YES') {
      this.confirmDeleteUser()
    }
  }

  private confirmDeleteUser(): void {
    if (!this.clientId) return
    this.userService.deleteUser(this.clientId).subscribe({
      next: () => {
        this.showDeleteUserModal = false
        this.snackBarService.showSuccess(this.translateService.instant('CLIENTS.DELETE_USER_SUCCESS'))
        this.router.navigate(this.panelView ? ['/admin/clients'] : ['/admin/mobile/clients'])
      },
      error: ({ error }) => {
        this.snackBarService.showError(error?.message ?? this.translateService.instant('errors.somethingWentWrong'))
      }
    })
  }

  ngOnInit(): void {
    if (this.route.snapshot.data['panelView'] === true) {
      this.panelView = true
    }

    this._setupClassSelectionFormSubscriptions()

    this.routeSubscription = this._getUserIdRoute().paramMap.pipe(
      map(params => params.get('user-id')),
      distinctUntilChanged()
    ).subscribe(userId => {
      if (!userId) {
        return
      }

      this._loadClientDetails(userId)
    })
  }

  ngOnDestroy(): void {
    this.routeSubscription?.unsubscribe()
  }

  private _getUserIdRoute(): ActivatedRoute {
    if (this.route.snapshot.paramMap.has('user-id')) {
      return this.route
    }

    if (this.route.parent?.snapshot.paramMap.has('user-id')) {
      return this.route.parent
    }

    return this.route
  }

  private _loadClientDetails(userId: string): void {
    forkJoin({
      clientEnrollmentDetails: this.enrollmentService.getClientEnrollmentDetails(userId),
      waitlistEntries: this.waitlistService.getAllWaitlistEntries(),
      classes: this.classService.getAllClasses()
    }).subscribe({
      next: ({ clientEnrollmentDetails, waitlistEntries, classes }) => {
        this.client = clientEnrollmentDetails.client
        this.clientId = this.client._id
        this.classEnrollmentInfo = clientEnrollmentDetails.enrolledClassInfo
        this.allClasses = classes
        this._buildWaitlistClassInfo(userId, waitlistEntries)
        this._separateActiveAndTerminated(this.classEnrollmentInfo)
        this._loadCanDeleteUser()
      },
      error: ({ error }) => {
        this.snackBarService.showError(error.message)
      }
    })
  }

  private _buildWaitlistClassInfo(userId: string, waitlistEntries: WaitlistEntry[]): void {
    const seenClassIds = new Set<string>()
    this.waitlistClassInfo = []

    waitlistEntries
      .filter(entry => entry.userId === userId)
      .forEach(entry => {
        if (seenClassIds.has(entry.classId)) {
          return
        }

        seenClassIds.add(entry.classId)
        this.waitlistClassInfo.push({
          classId: entry.classId,
          className: this.getClassDisplayName(entry.classId)
        })
      })
  }

  getClassDisplayName(classId: string): string {
    const classItem = this.allClasses.find(c => c._id === classId)
    if (!classItem) return classId
    const daysStr = classItem.days.map((d: number) => ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][d]).join('/')
    return `${daysStr} - ${classItem.startTime} - ${classItem.classLocation}`
  }

  private _setupClassSelectionFormSubscriptions(): void {
    this.classSelectionForm.get('class_type')?.valueChanges.subscribe((selectedClassType: ClassType) => {
      if (!this.classScheduleMap) return 

      this.selectedType = selectedClassType
      const locations = Object.keys(this.classScheduleMap[selectedClassType] || {})
      this.classLocationOptions = locations.map(location => ({
        value: location, 
        viewValue: location
      }))

      this.selectedLocation = ''
      this.classSelectionForm.get('location')?.reset('', { emitEvent: false })
      this.selectedClassId = ''
      this.classSelectionForm.get('time')?.reset('', { emitEvent: false })
    })

    this.classSelectionForm.get('location')?.valueChanges.subscribe((selectedLocation: string) => {
      if (!this.classScheduleMap || !this.selectedType) return
      
      this.selectedLocation = selectedLocation
      const timeMap = this.classScheduleMap[this.selectedType]?.[selectedLocation] || {};

      // Filter out time slots for classes the client is already actively enrolled in
      const activeClassIds = this._getActiveEnrolledClassIds(this.selectedType, selectedLocation)
      
      this.classTimesOptions = Object.keys(timeMap)
        .filter(timeSlot => {
          const classId = timeMap[timeSlot]
          return !activeClassIds.has(classId)
        })
        .map(timeSlot => ({
          value: timeSlot, 
          viewValue: timeSlot
        }))
      
      this.selectedClassId = ''
      this.classSelectionForm.get('time')?.reset('', { emitEvent: false })
    })

    this.classSelectionForm.get('time')?.valueChanges.subscribe((selectedTime: string) => {
      if (!this.classScheduleMap || !this.selectedType || !this.selectedLocation) return
    
      this.selectedClassId = this.classScheduleMap[this.selectedType]?.[this.selectedLocation]?.[selectedTime]!
    })
  }

  get f() { 
    return this.classSelectionForm.controls
  }

  public setShowEnrollmentModal(): void {
    if (!this.client) return 

    this.classService.getClassScheduleMap().subscribe({
      next: (classScheduleMap: ClassScheduleMap) => {
        if (classScheduleMap) {
          this.classScheduleMap = classScheduleMap
          this.classTypeOptions = Object.keys(classScheduleMap).map(classType => ({
            viewValue: classType, 
            value: classType
          }))

          this.showEnrollmentModal = true
        }
      }, 
      error: ({error}) => {
        this.snackBarService.showError(error.message)
      }
    })
  }

  public processEnrollmentModalClick(event: { ref: ClientDetailsComponent, buttonTitle: string }): void {
    if (event.buttonTitle === 'CONTROLS.CANCEL' || event.buttonTitle === 'close-button') {
      this.classSelectionForm.reset()
      this.showEnrollmentModal = false
    } else if (event.buttonTitle === 'CLIENTS.ENROLL') {
      const billingFrequency = this.classSelectionForm.controls["billing_frequency_override"].value ?? null
      const daysOverride = this.classSelectionForm.controls["days_override"].value ?? null
      this.enrollmentService.enrollClient(this.selectedClassId, this.clientId!, this.f['start_date'].value._d, billingFrequency, daysOverride).subscribe({
        next: () => {
          if (this.clientId) {
            this._loadClientDetails(this.clientId)
          }
          this.snackBarService.showSuccess(this.translateService.instant('CLASSES.ADD_NEW_CLASS_SUCCESS'))
          this.showEnrollmentModal = false
        }, 
        error: ({error}) => {
          this.snackBarService.showError(error.message)
        }
      })
    }
  }

  public onAdvancedOptionsOpened(): void {
    this.classService.getClassDetails(this.selectedClassId).subscribe({
      next: (rsp: Class) => {
        this.advancedOptionsClassInfo = rsp
        this.disabledDaysChips = Object.values(Weekday)
          .filter(value => typeof value === 'number')
          .filter(value => !this.advancedOptionsClassInfo?.days.includes(value))
      }, 
      error: ({error}) => {
        this.snackBarService.showError(error.message)
      }
    })
  }

  private _getActiveEnrolledClassIds(classType: ClassType, location: string): Set<string> {
    const activeClassIds = new Set<string>()
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    // Check all enrollments (not just activeClassEnrollmentInfo) to include those with endDate that haven't passed
    this.classEnrollmentInfo.forEach(item => {
      // Skip if class type or location doesn't match
      if (item.class.classType !== classType || item.class.classLocation !== location) {
        return
      }

      // Check if enrollment is still active
      // An enrollment is active if:
      // 1. Status is ACTIVE (not UNENROLLED or TERMINATED)
      // 2. If it has an endDate, it hasn't passed yet (yesterday or earlier means it's ended)
      const isActive = item.enrollment.status === EnrollmentStatus.ACTIVE
      if (isActive) {
        if (item.enrollment.endDate) {
          const enrollmentEndDate = new Date(item.enrollment.endDate)
          enrollmentEndDate.setHours(0, 0, 0, 0)
          const yesterday = new Date(today)
          yesterday.setDate(yesterday.getDate() - 1)
          
          // If endDate has passed (yesterday or earlier), it's no longer active
          if (enrollmentEndDate <= yesterday) {
            return
          }
        }
        
        // Enrollment is still active, add its classId to the set
        activeClassIds.add(item.class._id)
      }
    })

    return activeClassIds
  }

  private _separateActiveAndTerminated(classEnrollmentInfo: { class: Class, enrollment: Enrollment }[]): void {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    this.activeClassEnrollmentInfo = []
    this.unenrolledClassEnrollmentInfo = []
    this.terminatedClassEnrollmentInfo = []

    classEnrollmentInfo.forEach(item => {
      // First check enrollment status - if UNENROLLED, add to unenrolled section
      if (item.enrollment.status === EnrollmentStatus.UNENROLLED) {
        this.unenrolledClassEnrollmentInfo.push(item)
      } else if (item.class.endDate) {
        // Check if class is terminated
        const endDate = new Date(item.class.endDate)
        endDate.setHours(0, 0, 0, 0)
        if (endDate <= today) {
          this.terminatedClassEnrollmentInfo.push(item)
        } else {
          this.activeClassEnrollmentInfo.push(item)
        }
      } else {
        this.activeClassEnrollmentInfo.push(item)
      }
    })
  }

  get classesGrouped(): Map<ClassType, Map<string, { class: Class, enrollment: Enrollment }[]>> | undefined {
    return this.activeClassEnrollmentInfo?.reduce((typeMap, classEnrollment) => {
      const { class: classObj, enrollment } = classEnrollment

      if (!typeMap.has(classObj.classType)) {
        typeMap.set(classObj.classType, new Map<string, { class: Class, enrollment: Enrollment }[]>())
      }
      const locationMap = typeMap.get(classObj.classType)!

      const locationKey = classObj.classLocation;
      const locationClasses = locationMap.get(locationKey) || [];

      locationClasses.push({ class: classObj, enrollment });
      locationMap.set(locationKey, locationClasses)
   
      return typeMap;
    }, new Map<ClassType, Map<string, { class: Class, enrollment: Enrollment }[]>>());
  }

  get unenrolledClassesGrouped(): Map<ClassType, Map<string, { class: Class, enrollment: Enrollment }[]>> | undefined {
    return this.unenrolledClassEnrollmentInfo?.reduce((typeMap, classEnrollment) => {
      const { class: classObj, enrollment } = classEnrollment

      if (!typeMap.has(classObj.classType)) {
        typeMap.set(classObj.classType, new Map<string, { class: Class, enrollment: Enrollment }[]>())
      }
      const locationMap = typeMap.get(classObj.classType)!

      const locationKey = classObj.classLocation;
      const locationClasses = locationMap.get(locationKey) || [];

      locationClasses.push({ class: classObj, enrollment });
      locationMap.set(locationKey, locationClasses)
   
      return typeMap;
    }, new Map<ClassType, Map<string, { class: Class, enrollment: Enrollment }[]>>());
  }

  get terminatedClassesGrouped(): Map<ClassType, Map<string, { class: Class, enrollment: Enrollment }[]>> | undefined {
    return this.terminatedClassEnrollmentInfo?.reduce((typeMap, classEnrollment) => {
      const { class: classObj, enrollment } = classEnrollment

      if (!typeMap.has(classObj.classType)) {
        typeMap.set(classObj.classType, new Map<string, { class: Class, enrollment: Enrollment }[]>())
      }
      const locationMap = typeMap.get(classObj.classType)!

      const locationKey = classObj.classLocation;
      const locationClasses = locationMap.get(locationKey) || [];

      locationClasses.push({ class: classObj, enrollment });
      locationMap.set(locationKey, locationClasses)
   
      return typeMap;
    }, new Map<ClassType, Map<string, { class: Class, enrollment: Enrollment }[]>>());
  }

  editClient(): void {
    if (this.clientId) {
      if (this.panelView) {
        this.router.navigate(['/admin/clients', this.clientId, 'edit'])
        return
      }

      this.router.navigate(['../edit'], { relativeTo: this.route })
    }
  }

  getClassDetailsLink(classId: string | undefined): string[] {
    if (!classId) {
      return []
    }

    return this.panelView
      ? ['/admin/classes', classId, 'details']
      : ['/admin/mobile/classes', classId, 'details']
  }

  getPaymentHistoryLink(enrollmentId: string | undefined): string[] {
    if (!enrollmentId || !this.clientId) {
      return []
    }

    return this.panelView
      ? ['/admin/clients', this.clientId, 'payments', enrollmentId]
      : ['../payments', enrollmentId]
  }

  onNotesUpdated(notes: Note[]): void {
    if (this.client) {
      this.client.notes = notes
    }
  }

  /** Whether the enrollment has a days override (partial enrollment). Used in template to avoid strict null errors. */
  isPartiallyEnrolled(item: { class: Class, enrollment: Enrollment } | null | undefined): boolean {
    const override = item?.enrollment?.daysOfWeekOverride
    return Array.isArray(override) && override.length > 0
  }

  public setShowUnenrollModal(classAndEnrollment: { class: Class, enrollment: Enrollment }): void {
    this.selectedEnrollmentForUnenroll = classAndEnrollment
    this.unenrollForm.reset()
    this.showUnenrollModal = true
  }

  public processUnenrollModalClick(event: { ref: ClientDetailsComponent, buttonTitle: string }): void {
    if (event.buttonTitle === 'CONTROLS.CANCEL' || event.buttonTitle === 'close-button') {
      this.unenrollForm.reset()
      this.showUnenrollModal = false
      this.selectedEnrollmentForUnenroll = null
    } else if (event.buttonTitle === 'CLIENTS.UNENROLL') {
      if (!this.selectedEnrollmentForUnenroll) return
      
      const cancelReason = this.unenrollForm.get('cancelReason')?.value || undefined
      this.enrollmentService.unenrollClient(this.selectedEnrollmentForUnenroll.enrollment._id, cancelReason, this.clientId!).subscribe({
        next: () => {
          if (this.clientId) {
            this._loadClientDetails(this.clientId)
          }
          this.snackBarService.showSuccess(this.translateService.instant('CLIENTS.UNENROLL_SUCCESS'))
          this.showUnenrollModal = false
          this.selectedEnrollmentForUnenroll = null
          this.unenrollForm.reset()
        },
        error: ({error}) => {
          this.snackBarService.showError(error.message)
        }
      })
    }
  }
}