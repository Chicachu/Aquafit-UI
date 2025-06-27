import { ChangeDetectorRef, Component } from "@angular/core";
import { ButtonType } from "../../breadcrumb-nav-bar/breadcrumb-nav-bar.component";
import { ActivatedRoute } from "@angular/router";
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

@Component({
  selector: 'app-client-details',
  templateUrl: './client-details.component.html',
  styleUrls: ['./client-details.component.scss']
})
export class ClientDetailsComponent {
  readonly FormatOptions = FormatOptions
  ButtonType = ButtonType
  clientId: string | null = null
  client: User | null = null
  showEnrollmentModal = false
  enrollmentButtons = [{text: 'CONTROLS.CANCEL'}, {text: 'CLIENTS.ENROLL'}]
  classSelectionForm: FormGroup 
  classTypeOptions: SelectOption[] = []
  selectedType: ClassType | null = null 
  classLocationOptions: SelectOption[] = []
  selectedLocation: string = ''
  classTimesOptions: SelectOption[] = []
  classScheduleMap: ClassScheduleMap | null = null
  selectedClassId: string = ''
  classEnrollmentInfo: { class: Class, enrollment: Enrollment }[] = []
  weekdays: SelectOption[] = Object.keys(Weekday)
    .filter(key => isNaN(Number(key)))
    .map(key => ({
      viewValue: key.toUpperCase(),
      value: Weekday[key as keyof typeof Weekday].toString()
    }))
  billingFrequencyOptions: SelectOption[] = Object.keys(BillingFrequency)
    .map(key => ({
      viewValue: key.toUpperCase(),
      value: BillingFrequency[key as keyof typeof BillingFrequency]
    }))
  advancedOptionsClassInfo: Class | undefined
  disabledDaysChips: number[] = []

  constructor(
    private route: ActivatedRoute,
    private userService: UserService, 
    private snackBarService: SnackBarService, 
    private classService: ClassService,
    private fb: FormBuilder,
    private enrollmentService: EnrollmentService,
    private translateService: TranslateService
  ) {
    this.classSelectionForm = this.fb.group({
      class_type: ['', [Validators.required]],
      location: ['', [Validators.required]],
      time: ['', [Validators.required]],
      start_date: ['', [Validators.required]],
      days_override: ['', []],
      billing_frequency_override: ['', []]
    })
  }

  ngOnInit(): void {
    const userId = this.route.snapshot.paramMap.get('user-id')
    
    this.userService.getClientEnrollmentDetails(userId!).subscribe({
      next: (clientEnrollmentDetails: ClientEnrollmentDetails) => {
        this.client = clientEnrollmentDetails.client
        this.clientId = this.client._id
        this.classEnrollmentInfo = clientEnrollmentDetails.enrolledClassInfo
      },
      error: ({error}) => {
        this.snackBarService.showError(error.message)
      }
    })

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

      this.classTimesOptions = Object.keys(timeMap).map(timeSlot => ({
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
      this.enrollmentService.enrollClient(this.selectedClassId, this.clientId!, this.f['start_date'].value._d, BillingFrequency.MONTHLY).subscribe({
        next: () => {
          this.ngOnInit()
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
        console.log(this.disabledDaysChips)
      }, 
      error: ({error}) => {
        this.snackBarService.showError(error.message)
      }
    })
  }

  get classesGrouped(): Map<ClassType, Map<string, { class: Class, enrollment: Enrollment }[]>> | undefined {
    return this.classEnrollmentInfo?.reduce((typeMap, classEnrollment) => {
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
}