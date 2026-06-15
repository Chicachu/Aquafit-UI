import { Component, EventEmitter, HostBinding, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AssignmentService } from '@core/services/assignmentService';
import { ClassService } from '@core/services/classService';
import { ScheduleService } from '@core/services/scheduleService';
import { SnackBarService } from '@core/services/snackBarService';
import { TranslateService } from '@ngx-translate/core';
import { ClassType } from '@core/types/enums/classType';
import { ClassScheduleMap } from '@core/types/classScheduleMap';
import { SelectOption } from '@core/types/selectOption';
import { Class } from '@core/types/classes/class';
import { UserService } from '@core/services/userService';
import { forkJoin } from 'rxjs';
import { ButtonType } from '../../breadcrumb-nav-bar/breadcrumb-nav-bar.component';

@Component({
  selector: 'app-employee-assign-class',
  templateUrl: './employee-assign-class.component.html',
  styleUrls: ['./employee-assign-class.component.scss']
})
export class EmployeeAssignClassComponent implements OnInit, OnChanges {
  readonly ButtonType = ButtonType
  @Input() userId: string | null = null
  @Input() @HostBinding('class.panel-view') panelView = false
  employeeFirstName = ''
  employeeLastName = ''
  employeeLocation: string | null = null
  @Output() closed = new EventEmitter<void>()
  @Output() assigned = new EventEmitter<void>()

  classSelectionForm: FormGroup
  locationOptions: SelectOption[] = []
  classTypeOptions: SelectOption[] = []
  selectedLocation = ''
  selectedType: ClassType | null = null
  classTimesOptions: SelectOption[] = []
  classScheduleMap: ClassScheduleMap | null = null
  classIdsWithActiveAssignment: Set<string> = new Set()
  selectedClassId = ''
  selectedClassDays: number[] | null = null
  loading = false

  constructor(
    private fb: FormBuilder,
    private classService: ClassService,
    private assignmentService: AssignmentService,
    private scheduleService: ScheduleService,
    private snackBarService: SnackBarService,
    private translateService: TranslateService,
    private userService: UserService,
    private router: Router
  ) {
    this.classSelectionForm = this.fb.group({
      location: ['', [Validators.required]],
      class_type: ['', [Validators.required]],
      time: ['', [Validators.required]],
      start_date: ['', [Validators.required]]
    })
  }

  get f() {
    return this.classSelectionForm.controls
  }

  ngOnInit(): void {
    this._setupFormSubscriptions()
    this._loadData()
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['userId'] && !changes['userId'].firstChange) {
      this._resetForm()
      this._loadData()
    }
  }

  cancel(): void {
    if (this.panelView && this.userId) {
      this.router.navigate(['/admin/employees', this.userId, 'details'])
      return
    }

    this.closed.emit()
  }

  submit(): void {
    const raw = this.f['start_date'].value
    const startDate = raw?._d ? new Date(raw._d) : raw ? new Date(raw) : null

    if (!startDate || !this.userId || !this.selectedClassId) {
      this.snackBarService.showError(
        this.translateService.instant('ERRORS.REQUIRED', { field: this.translateService.instant('ERRORS.START_DATE') })
      )
      return
    }

    this.loading = true
    this.assignmentService.assignInstructor(this.selectedClassId, this.userId, startDate).subscribe({
      next: () => {
        this.scheduleService.invalidateEmployeeClassDetails(this.userId!)
        this.snackBarService.showSuccess(this.translateService.instant('EMPLOYEES.ASSIGN_SUCCESS'))
        this.loading = false
        this.assigned.emit()

        if (this.panelView && this.userId) {
          this.router.navigate(['/admin/employees', this.userId, 'details'])
        }
      },
      error: ({ error }) => {
        this.loading = false
        this.snackBarService.showError(error?.message ?? '')
      }
    })
  }

  private _loadData(): void {
    if (!this.userId) {
      return
    }

    forkJoin({
      classScheduleMap: this.classService.getClassScheduleMap(),
      classIds: this.assignmentService.getClassIdsWithActiveAssignments(),
      employee: this.userService.getUser(this.userId)
    }).subscribe({
      next: ({ classScheduleMap, classIds, employee }) => {
        if (!classScheduleMap) {
          return
        }

        this.classScheduleMap = classScheduleMap
        this.classIdsWithActiveAssignment = new Set(classIds)
        this.employeeFirstName = employee.firstName
        this.employeeLastName = employee.lastName
        this.employeeLocation = employee.workLocation ?? null
        this.locationOptions = this._getUniqueLocations(classScheduleMap).map((location) => ({
          value: location,
          viewValue: location
        }))
        this._applyEmployeeLocationPreset()
      },
      error: ({ error }) => {
        this.snackBarService.showError(error?.message ?? '')
      }
    })
  }

  private _applyEmployeeLocationPreset(): void {
    if (!this.employeeLocation) {
      return
    }

    const hasLocation = this.locationOptions.some((option) => option.value === this.employeeLocation)
    if (!hasLocation) {
      return
    }

    this.classSelectionForm.patchValue({ location: this.employeeLocation })
  }

  private _getUniqueLocations(classScheduleMap: ClassScheduleMap): string[] {
    const locations = new Set<string>()

    for (const classType of Object.keys(classScheduleMap)) {
      const locationMap = classScheduleMap[classType as ClassType] || {}
      for (const location of Object.keys(locationMap)) {
        locations.add(location)
      }
    }

    return Array.from(locations).sort()
  }

  private _getClassTypesForLocation(location: string): ClassType[] {
    if (!this.classScheduleMap) {
      return []
    }

    return (Object.keys(this.classScheduleMap) as ClassType[])
      .filter((classType) => !!this.classScheduleMap?.[classType]?.[location])
      .sort()
  }

  private _resetForm(): void {
    this.classSelectionForm.reset()
    this.selectedLocation = ''
    this.selectedType = null
    this.selectedClassId = ''
    this.selectedClassDays = null
    this.classTypeOptions = []
    this.classTimesOptions = []
    this.employeeLocation = null
  }

  private _setupFormSubscriptions(): void {
    this.classSelectionForm.get('location')?.valueChanges.subscribe((selectedLocation: string) => {
      if (!this.classScheduleMap) {
        return
      }

      this.selectedLocation = selectedLocation
      this.classTypeOptions = this._getClassTypesForLocation(selectedLocation).map((classType) => ({
        value: classType,
        viewValue: classType
      }))
      this.selectedType = null
      this.selectedClassId = ''
      this.selectedClassDays = null
      this.classTimesOptions = []
      this.classSelectionForm.get('class_type')?.reset('', { emitEvent: false })
      this.classSelectionForm.get('time')?.reset('', { emitEvent: false })
    })

    this.classSelectionForm.get('class_type')?.valueChanges.subscribe((selectedClassType: ClassType) => {
      if (!this.classScheduleMap || !this.selectedLocation) {
        return
      }

      this.selectedType = selectedClassType
      const timeMap = this.classScheduleMap[selectedClassType]?.[this.selectedLocation] || {}
      this.classTimesOptions = Object.keys(timeMap)
        .filter((timeSlot) => !this.classIdsWithActiveAssignment.has(timeMap[timeSlot]))
        .map((time) => ({ value: time, viewValue: time }))
      this.selectedClassId = ''
      this.selectedClassDays = null
      this.classSelectionForm.get('time')?.reset('', { emitEvent: false })
    })

    this.classSelectionForm.get('time')?.valueChanges.subscribe((selectedTime: string) => {
      if (!this.classScheduleMap || !this.selectedType || !this.selectedLocation) {
        return
      }

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
}
