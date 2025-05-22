import { ChangeDetectorRef, Component } from "@angular/core";
import { ButtonType } from "../../breadcrumb-nav-bar/breadcrumb-nav-bar.component";
import { ActivatedRoute } from "@angular/router";
import { UserService } from "@core/services/userService";
import { User } from "@core/types/user";
import { SnackBarService } from "@core/services/snackBarService";
import { ClassService } from "@core/services/classService";
import { Class } from "@core/types/classes/class";
import { SelectOption } from "@core/types/selectOption";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { ClassType } from "@core/types/enums/classType";
import { TranslateService } from "@ngx-translate/core";
import { ClassScheduleMap } from "@core/types/classScheduleMap";
import { FormatOptions } from "@core/types/enums/formatOptions";

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

  constructor(
    private route: ActivatedRoute,
    private userService: UserService, 
    private snackBarService: SnackBarService, 
    private classService: ClassService,
    private fb: FormBuilder,
    private cdr: ChangeDetectorRef
  ) {
    this.classSelectionForm = this.fb.group({
      class_type: ['', [Validators.required]],
      location: ['', [Validators.required]],
      time: ['', [Validators.required]]
    })
  }

  ngOnInit(): void {
    const userId = this.route.snapshot.paramMap.get('user-id')
    
    this.userService.getUser(userId!).subscribe({
      next: (user: User) => {
        this.client = user
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

      this.cdr.detectChanges()
    })

    this.classSelectionForm.get('location')?.valueChanges.subscribe((selectedLocation: string) => {
      if (!this.classScheduleMap || !this.selectedType) return
      
      this.selectedLocation = selectedLocation
      this.classTimesOptions = (this.classScheduleMap[this.selectedType]?.[selectedLocation] || []).map(timeSlot => ({
        value: timeSlot,
        viewValue: timeSlot
      })) 

      this.cdr.detectChanges()
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
      this.showEnrollmentModal = false
    }
  }
}