import { Component } from "@angular/core";
import { ButtonType } from "../../breadcrumb-nav-bar/breadcrumb-nav-bar.component";
import { ActivatedRoute, Router } from "@angular/router";
import { UserService } from "@core/services/userService";
import { User } from "@core/types/user";
import { SnackBarService } from "@core/services/snackBarService";
import { TranslateService } from "@ngx-translate/core";
import { InstructorClassDetails } from "@core/types/instructors/instructorClassDetails";
import { Class } from "@core/types/classes/class";
import { Note } from "@core/types/user";
import { ClassType } from "@core/types/enums/classType";
import { ClassService } from "@core/services/classService";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { ClassScheduleMap } from "@core/types/classScheduleMap";
import { SelectOption } from "@core/types/selectOption";
import { AssignmentService } from "@core/services/assignmentService";
import { Assignment } from "@core/types/assignment";
import { AssignmentStatus } from "@core/types/enums/assignmentStatus";
import { forkJoin } from "rxjs";

@Component({
  selector: 'app-instructors-details',
  templateUrl: './instructors-details.component.html',
  styleUrls: ['./instructors-details.component.scss']
})
export class InstructorsDetailsComponent {
  readonly ClassType = ClassType
  readonly AssignmentStatus = AssignmentStatus
  ButtonType = ButtonType
  instructorId: string | null = null
  instructor: User | null = null
  canEditInstructor = false
  showAssignmentModal = false
  assignmentButtons = [{text: 'CONTROLS.CANCEL'}, {text: 'INSTRUCTORS.ASSIGN_INSTRUCTOR'}]
  showUnassignModal = false
  unassignButtons = [{text: 'CONTROLS.CANCEL'}, {text: 'INSTRUCTORS.UNASSIGN'}]
  unassignForm: FormGroup
  selectedAssignmentForUnassign: { class: Class, assignment: Assignment } | null = null
  assignmentInfo: { class: Class, assignment: Assignment }[] = []
  activeAssignmentInfo: { class: Class, assignment: Assignment }[] = []
  terminatedAssignmentInfo: { class: Class, assignment: Assignment }[] = []
  classSelectionForm: FormGroup
  classTypeOptions: SelectOption[] = []
  selectedType: ClassType | null = null
  classLocationOptions: SelectOption[] = []
  selectedLocation: string = ''
  classTimesOptions: SelectOption[] = []
  classScheduleMap: ClassScheduleMap | null = null
  /** Class IDs that have any active assignment (any instructor). Used to hide those classes from the Assign Instructor modal. */
  classIdsWithActiveAssignment: Set<string> = new Set()
  selectedClassId: string = ''
  selectedClassDays: number[] | null = null

  constructor(
    private route: ActivatedRoute,
    public userService: UserService,
    private snackBarService: SnackBarService,
    private translateService: TranslateService,
    private router: Router,
    private classService: ClassService,
    private fb: FormBuilder,
    private assignmentService: AssignmentService
  ) {
    this.classSelectionForm = this.fb.group({
      class_type: ['', [Validators.required]],
      location: ['', [Validators.required]],
      time: ['', [Validators.required]],
      start_date: ['', [Validators.required]]
    })
    this.unassignForm = this.fb.group({
      end_date: ['', [Validators.required]]
    })
  }

  get unassignMinDate(): Date | null {
    const a = this.selectedAssignmentForUnassign?.assignment?.startDate
    return a ? new Date(a) : null
  }

  ngOnInit(): void {
    this.canEditInstructor = this.userService.isAdmin
    const userId = this.route.snapshot.paramMap.get('user-id')
    
    this.userService.getInstructorClassDetails(userId!).subscribe({
      next: (instructorClassDetails: InstructorClassDetails) => {
        this.instructor = instructorClassDetails.instructor
        this.instructorId = this.instructor._id
        this.assignmentInfo = instructorClassDetails.assignmentInfo
        this._separateActiveAndTerminated(this.assignmentInfo)
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
      this.selectedClassId = ''
      this.selectedClassDays = null
      this.classSelectionForm.get('location')?.reset('', { emitEvent: false })
      this.classSelectionForm.get('time')?.reset('', { emitEvent: false })
    })

    this.classSelectionForm.get('location')?.valueChanges.subscribe((selectedLocation: string) => {
      if (!this.classScheduleMap || !this.selectedType) return 
      
      this.selectedLocation = selectedLocation
      const timeMap = this.classScheduleMap[this.selectedType]?.[selectedLocation] || {};

      // Filter out time slots for classes the instructor is already assigned to
      const assignedClassIds = this._getAssignedClassIds(this.selectedType, selectedLocation)
      
      this.classTimesOptions = Object.keys(timeMap)
        .filter(timeSlot => {
          const classId = timeMap[timeSlot]
          return !assignedClassIds.has(classId)
        })
        .map(timeSlot => ({
          value: timeSlot, 
          viewValue: timeSlot
        }))
      
      this.selectedClassId = ''
      this.selectedClassDays = null
      this.classSelectionForm.get('time')?.reset('', { emitEvent: false })
    })

    this.classSelectionForm.get('time')?.valueChanges.subscribe((selectedTime: string) => {
      if (!this.classScheduleMap || !this.selectedType || !this.selectedLocation) return 
    
      this.selectedClassId = this.classScheduleMap[this.selectedType]?.[this.selectedLocation]?.[selectedTime]!
      this.selectedClassDays = null

      if (this.selectedClassId) {
        this.classService.getClass(this.selectedClassId).subscribe({
          next: (classDetails: Class) => {
            this.selectedClassDays = classDetails.days ?? null
          },
          error: () => {
            this.selectedClassDays = null
          }
        })
      }
    })
  }

  get f() { 
    return this.classSelectionForm.controls
  }

  public setShowAssignmentModal(): void {
    if (!this.instructor) return 

    // Reset form and clear selections when opening modal
    this.classSelectionForm.reset()
    this.selectedType = null
    this.selectedLocation = ''
    this.selectedClassId = ''
    this.selectedClassDays = null
    this.classLocationOptions = []
    this.classTimesOptions = []
    this.classIdsWithActiveAssignment = new Set()

    forkJoin({
      classScheduleMap: this.classService.getClassScheduleMap(),
      classIds: this.assignmentService.getClassIdsWithActiveAssignments()
    }).subscribe({
      next: ({ classScheduleMap, classIds }) => {
        if (classScheduleMap) {
          this.classScheduleMap = classScheduleMap
          this.classIdsWithActiveAssignment = new Set(classIds)
          this.classTypeOptions = Object.keys(classScheduleMap).map(classType => ({
            viewValue: classType, 
            value: classType
          }))
          this.showAssignmentModal = true
        }
      },
      error: ({ error }) => {
        this.snackBarService.showError(error?.message ?? '')
      }
    })
  }

  public processAssignmentModalClick(event: { ref: InstructorsDetailsComponent, buttonTitle: string }): void {
    if (event.buttonTitle === 'CONTROLS.CANCEL' || event.buttonTitle === 'close-button') {
      this.classSelectionForm.reset()
      this.selectedType = null
      this.selectedLocation = ''
      this.selectedClassId = ''
      this.selectedClassDays = null
      this.classLocationOptions = []
      this.classTimesOptions = []
      this.showAssignmentModal = false
    } else if (event.buttonTitle === 'INSTRUCTORS.ASSIGN_INSTRUCTOR') {
      this.assignmentService.assignInstructor(this.selectedClassId, this.instructorId!, this.f['start_date'].value._d).subscribe({
        next: () => {
          this.classSelectionForm.reset()
          this.selectedType = null
          this.selectedLocation = ''
          this.selectedClassId = ''
          this.selectedClassDays = null
          this.classLocationOptions = []
          this.classTimesOptions = []
          this.ngOnInit()
          this.snackBarService.showSuccess(this.translateService.instant('INSTRUCTORS.ASSIGN_SUCCESS'))
          this.showAssignmentModal = false
        }, 
        error: ({error}) => {
          this.snackBarService.showError(error.message)
        }
      })
    }
  }

  /** Class IDs that have any active assignment (any instructor). Used to hide them from the Assign Instructor modal time-slot list. */
  private _getAssignedClassIds(_classType: ClassType, _location: string): Set<string> {
    return this.classIdsWithActiveAssignment
  }

  private _separateActiveAndTerminated(assignmentInfo: { class: Class, assignment: Assignment }[]): void {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    this.activeAssignmentInfo = []
    this.terminatedAssignmentInfo = []

    assignmentInfo.forEach(item => {
      if (item.class.endDate) {
        const endDate = new Date(item.class.endDate)
        endDate.setHours(0, 0, 0, 0)
        if (endDate <= today) {
          this.terminatedAssignmentInfo.push(item)
        } else {
          this.activeAssignmentInfo.push(item)
        }
      } else {
        this.activeAssignmentInfo.push(item)
      }
    })
  }

  get assignmentsGrouped(): Map<ClassType, Map<string, { class: Class, assignment: Assignment }[]>> | undefined {
    return this.activeAssignmentInfo?.reduce((typeMap, item) => {
      const { class: classObj } = item

      if (!typeMap.has(classObj.classType)) {
        typeMap.set(classObj.classType, new Map<string, { class: Class, assignment: Assignment }[]>())
      }
      const locationMap = typeMap.get(classObj.classType)!

      const locationKey = classObj.classLocation;
      const locationAssignments = locationMap.get(locationKey) || [];

      locationAssignments.push(item);
      locationMap.set(locationKey, locationAssignments)
   
      return typeMap;
    }, new Map<ClassType, Map<string, { class: Class, assignment: Assignment }[]>>());
  }

  get terminatedAssignmentsGrouped(): Map<ClassType, Map<string, { class: Class, assignment: Assignment }[]>> | undefined {
    return this.terminatedAssignmentInfo?.reduce((typeMap, item) => {
      const { class: classObj } = item

      if (!typeMap.has(classObj.classType)) {
        typeMap.set(classObj.classType, new Map<string, { class: Class, assignment: Assignment }[]>())
      }
      const locationMap = typeMap.get(classObj.classType)!

      const locationKey = classObj.classLocation;
      const locationAssignments = locationMap.get(locationKey) || [];

      locationAssignments.push(item);
      locationMap.set(locationKey, locationAssignments)
   
      return typeMap;
    }, new Map<ClassType, Map<string, { class: Class, assignment: Assignment }[]>>());
  }

  get canViewPaymentDetails(): boolean {
    if (!this.instructor) return false
    return (
      this.userService.isAdmin ||
      this.userService.user?._id === this.instructor._id
    )
  }

  editInstructor(): void {
    if (this.instructorId) {
      this.router.navigate(['../edit'], { relativeTo: this.route })
    }
  }

  onNotesUpdated(notes: Note[]): void {
    if (this.instructor) {
      this.instructor.notes = notes
    }
  }

  setShowUnassignModal(classAndAssignment: { class: Class, assignment: Assignment }): void {
    this.selectedAssignmentForUnassign = classAndAssignment
    this.unassignForm.reset()
    this.showUnassignModal = true
  }

  processUnassignModalClick(event: { ref: InstructorsDetailsComponent, buttonTitle: string }): void {
    if (event.buttonTitle === 'CONTROLS.CANCEL' || event.buttonTitle === 'close-button') {
      this.unassignForm.reset()
      this.showUnassignModal = false
      this.selectedAssignmentForUnassign = null
    } else if (event.buttonTitle === 'INSTRUCTORS.UNASSIGN') {
      if (!this.selectedAssignmentForUnassign) return
      const raw = this.unassignForm.get('end_date')?.value
      const endDate = raw?._d ? new Date(raw._d) : raw ? new Date(raw) : null
      if (!endDate) {
        this.snackBarService.showError(this.translateService.instant('ERRORS.REQUIRED', { field: 'End date' }))
        return
      }
      this.assignmentService.updateAssignment(this.selectedAssignmentForUnassign.assignment._id!, { endDate }).subscribe({
        next: () => {
          this.ngOnInit()
          this.snackBarService.showSuccess(this.translateService.instant('INSTRUCTORS.UNASSIGN_SUCCESS'))
          this.showUnassignModal = false
          this.selectedAssignmentForUnassign = null
          this.unassignForm.reset()
        },
        error: ({ error }) => {
          this.snackBarService.showError(error?.message ?? 'Error updating assignment.')
        }
      })
    }
  }
}
