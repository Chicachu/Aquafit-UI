import { Component, HostBinding, Input, OnDestroy, OnInit } from "@angular/core";
import { FormBuilder, FormGroup } from "@angular/forms";
import { ActivatedRoute, NavigationEnd, Router } from "@angular/router";
import { filter } from "rxjs/operators";
import { ButtonType } from "../../breadcrumb-nav-bar/breadcrumb-nav-bar.component";
import { Class } from "@/core/types/classes/class";
import { ClassService } from "@/core/services/classService";
import { SnackBarService } from "@/core/services/snackBarService";
import { ClassType } from "@/core/types/enums/classType";
import { UserService } from "@/core/services/userService";
import { Weekday } from "@/core/types/enums/weekday";
import { SelectOption } from "@/core/types/selectOption";
import { FormatOptions } from "@/core/types/enums/formatOptions";
import { Subscription } from "rxjs";

type GroupedClasses = Map<ClassType, Map<string, Class[]>>;

@Component({
  selector: 'app-class-list',
  templateUrl: './class-list.component.html',
  styleUrls: ['./class-list.component.scss']
})
export class ClassListComponent implements OnInit, OnDestroy {
  @Input() showBreadcrumb = true
  @Input() @HostBinding('class.panel-view') panelView = false

  ButtonType = ButtonType
  FormatOptions = FormatOptions
  classes: Class[] | null = null
  activeClasses: Class[] = []
  terminatedClasses: Class[] = []
  filterForm: FormGroup
  classTypeOptions: SelectOption[] = []
  locationOptions: SelectOption[] = []
  classesGrouped: GroupedClasses = new Map()
  terminatedClassesGrouped: GroupedClasses = new Map()
  selectedClassId: string | null = null
  classesLoaded = false

  private subscriptions = new Subscription()

  constructor(
    private classService: ClassService,
    private snackBarService: SnackBarService,
    private router: Router,
    private route: ActivatedRoute,
    private userService: UserService,
    private fb: FormBuilder
  ) {
    this.filterForm = this.fb.group({
      classType: ['ALL'],
      location: ['ALL']
    })
  }

  get buttonType(): ButtonType {
    return this.userService.isAdmin ? ButtonType.ADD : ButtonType.NONE
  }

  get canAddClass(): boolean {
    return this.userService.isAdmin
  }

  get hasNoClasses(): boolean {
    return this.classesLoaded && this.activeClasses.length === 0 && this.terminatedClasses.length === 0
  }

  ngOnInit(): void {
    this._loadClasses()

    this.subscriptions.add(
      this.filterForm.valueChanges.subscribe(() => {
        this._updateGroupedClasses()
      })
    )

    if (this.panelView) {
      this._updateSelectedClassId()
      this.subscriptions.add(
        this.router.events.pipe(
          filter((event): event is NavigationEnd => event instanceof NavigationEnd)
        ).subscribe(() => {
          this._updateSelectedClassId()
          this._loadClasses()
        })
      )
    }
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe()
  }

  addNewClass(): void {
    if (this.panelView) {
      this.router.navigate(['/admin/classes/add-class'])
      return
    }

    this.router.navigate(['add-class'], { relativeTo: this.route })
  }

  private _loadClasses(): void {
    this.classService.getAllClasses().subscribe({
      next: (classes: Class[]) => {
        this.classes = classes
        this.classesLoaded = true
        this._separateActiveAndTerminated(classes)
        this._generateFilterOptions(classes)
        this._updateGroupedClasses()
      },
      error: ({ error }) => {
        this.snackBarService.showError(error.message)
      }
    })
  }

  isClassSelected(classId: string): boolean {
    return this.panelView && this.selectedClassId === classId
  }

  private _updateSelectedClassId(): void {
    this.selectedClassId = this._findClassIdInRouteTree(this.route)
  }

  private _findClassIdInRouteTree(route: ActivatedRoute): string | null {
    const classId = route.snapshot.paramMap.get('class-id')
    if (classId) {
      return classId
    }

    if (route.firstChild) {
      const childClassId = this._findClassIdInRouteTree(route.firstChild)
      if (childClassId) {
        return childClassId
      }
    }

    return null
  }

  private _updateGroupedClasses(): void {
    this.classesGrouped = this._groupClasses(this._getFilteredClasses(this.activeClasses))
    this.terminatedClassesGrouped = this._groupClasses(this._getFilteredClasses(this.terminatedClasses))
  }

  private _getFilteredClasses(classes: Class[]): Class[] {
    const selectedClassType = this.filterForm.get('classType')?.value
    const selectedLocation = this.filterForm.get('location')?.value

    return classes.filter(class_ => {
      const matchesType = selectedClassType === 'ALL' || class_.classType === selectedClassType
      const matchesLocation = selectedLocation === 'ALL' || class_.classLocation === selectedLocation
      return matchesType && matchesLocation
    })
  }

  private _groupClasses(classes: Class[]): GroupedClasses {
    return classes.reduce((typeMap, class_) => {
      if (!typeMap.has(class_.classType)) {
        typeMap.set(class_.classType, new Map<string, Class[]>())
      }

      const locationMap = typeMap.get(class_.classType)!
      const locationClasses = locationMap.get(class_.classLocation) || []
      locationClasses.push(class_)
      locationMap.set(class_.classLocation, locationClasses)

      return typeMap
    }, new Map<ClassType, Map<string, Class[]>>())
  }

  private _generateFilterOptions(classes: Class[]): void {
    const availableClassTypes = new Set<ClassType>()
    classes.forEach(class_ => {
      availableClassTypes.add(class_.classType)
    })

    this.classTypeOptions = [
      { value: 'ALL', viewValue: 'CLASSES.ALL_TYPES' }
    ]

    Array.from(availableClassTypes).sort().forEach(classType => {
      this.classTypeOptions.push({
        value: classType,
        viewValue: `CLASS_TYPES.${classType}`
      })
    })

    const availableLocations = new Set<string>()
    classes.forEach(class_ => {
      availableLocations.add(class_.classLocation)
    })

    this.locationOptions = [
      { value: 'ALL', viewValue: 'CLASSES.ALL_LOCATIONS' }
    ]

    Array.from(availableLocations).sort().forEach(location => {
      this.locationOptions.push({
        value: location,
        viewValue: location
      })
    })
  }

  private _separateActiveAndTerminated(classes: Class[]): void {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    this.activeClasses = []
    this.terminatedClasses = []

    classes.forEach(classItem => {
      if (classItem.endDate) {
        const endDate = new Date(classItem.endDate)
        endDate.setHours(0, 0, 0, 0)
        if (endDate <= today) {
          this.terminatedClasses.push(classItem)
        } else {
          this.activeClasses.push(classItem)
        }
      } else {
        this.activeClasses.push(classItem)
      }
    })

    this.activeClasses = this._sortClassesByDayAndTime(this.activeClasses)
    this.terminatedClasses = this._sortClassesByDayAndTime(this.terminatedClasses)
  }

  private _sortClassesByDayAndTime(classes: Class[]): Class[] {
    return [...classes].sort((a, b) => {
      const mapDayForSorting = (day: Weekday): number => {
        return day === Weekday.SUNDAY ? 7 : day
      }

      const aEarliestDay = Math.min(...a.days.map(mapDayForSorting))
      const bEarliestDay = Math.min(...b.days.map(mapDayForSorting))

      if (aEarliestDay !== bEarliestDay) {
        return aEarliestDay - bEarliestDay
      }

      return this._compareTimeStrings(a.startTime, b.startTime)
    })
  }

  private _compareTimeStrings(timeA: string, timeB: string): number {
    const [hoursA, minutesA = 0] = timeA.split(':').map(Number)
    const [hoursB, minutesB = 0] = timeB.split(':').map(Number)

    const totalMinutesA = hoursA * 60 + minutesA
    const totalMinutesB = hoursB * 60 + minutesB

    return totalMinutesA - totalMinutesB
  }
}
