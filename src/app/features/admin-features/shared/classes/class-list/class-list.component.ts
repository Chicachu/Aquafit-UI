import { Component, OnInit } from "@angular/core";
import { FormBuilder, FormGroup } from "@angular/forms";
import { ButtonType } from "../../breadcrumb-nav-bar/breadcrumb-nav-bar.component";
import { Class } from "@/core/types/classes/class";
import { ClassService } from "@/core/services/classService";
import { SnackBarService } from "@/core/services/snackBarService";
import { Router } from "@angular/router";
import { ClassType } from "@/core/types/enums/classType";
import { UserService } from "@/core/services/userService";
import { Weekday } from "@/core/types/enums/weekday";
import { SelectOption } from "@/core/types/selectOption";
import { FormatOptions } from "@/core/types/enums/formatOptions";

@Component({
  selector: 'app-class-list',
  templateUrl: './class-list.component.html',
  styleUrls: ['./class-list.component.scss']
})
export class ClassListComponent implements OnInit {
  ButtonType = ButtonType
  FormatOptions = FormatOptions
  classes: Class[] | null = null
  activeClasses: Class[] = []
  terminatedClasses: Class[] = []
  filterForm: FormGroup
  classTypeOptions: SelectOption[] = []
  locationOptions: SelectOption[] = []

  constructor(
    private classService: ClassService,
    private snackBarService: SnackBarService,
    private router: Router,
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

  ngOnInit(): void {
    this.classService.getAllClasses().subscribe({
      next: (classes: Class[]) => {
        this.classes = classes
        this._separateActiveAndTerminated(classes)
        this._generateFilterOptions(classes)
      },
      error: ({error}) => {
        this.snackBarService.showError(error.message)
      }
    })
  }

  private _generateFilterOptions(classes: Class[]): void {
    // Get unique class types from the dataset
    const availableClassTypes = new Set<ClassType>()
    classes.forEach(class_ => {
      availableClassTypes.add(class_.classType)
    })

    // Generate class type options with "All Types" first
    this.classTypeOptions = [
      { value: 'ALL', viewValue: 'CLASSES.ALL_TYPES' }
    ]
    
    // Only add class types that exist in the dataset
    Array.from(availableClassTypes).sort().forEach(classType => {
      this.classTypeOptions.push({
        value: classType,
        viewValue: `CLASS_TYPES.${classType}`
      })
    })

    // Get unique locations from the dataset
    const availableLocations = new Set<string>()
    classes.forEach(class_ => {
      availableLocations.add(class_.classLocation)
    })

    // Generate location options with "All Locations" first
    this.locationOptions = [
      { value: 'ALL', viewValue: 'CLASSES.ALL_LOCATIONS' }
    ]
    
    // Only add locations that exist in the dataset, sorted alphabetically
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

    // Sort both arrays by day and time
    this.activeClasses = this._sortClassesByDayAndTime(this.activeClasses)
    this.terminatedClasses = this._sortClassesByDayAndTime(this.terminatedClasses)
  }

  /**
   * Sort classes by day of week (Monday first, Sunday last) and then by start time
   */
  private _sortClassesByDayAndTime(classes: Class[]): Class[] {
    return [...classes].sort((a, b) => {
      // Get the earliest day for each class (classes can have multiple days)
      // Map Sunday (0) to 7 so it comes after Saturday (6)
      const mapDayForSorting = (day: Weekday): number => {
        return day === Weekday.SUNDAY ? 7 : day
      }
      
      const aEarliestDay = Math.min(...a.days.map(mapDayForSorting))
      const bEarliestDay = Math.min(...b.days.map(mapDayForSorting))
      
      // Sort by day first (Monday=1, Tuesday=2, ..., Saturday=6, Sunday=7)
      if (aEarliestDay !== bEarliestDay) {
        return aEarliestDay - bEarliestDay
      }
      
      // If same day, sort by start time
      return this._compareTimeStrings(a.startTime, b.startTime)
    })
  }

  /**
   * Compare two time strings (e.g., "9:00", "14:30")
   * Returns negative if a < b, positive if a > b, 0 if equal
   */
  private _compareTimeStrings(timeA: string, timeB: string): number {
    const [hoursA, minutesA = 0] = timeA.split(':').map(Number)
    const [hoursB, minutesB = 0] = timeB.split(':').map(Number)
    
    const totalMinutesA = hoursA * 60 + minutesA
    const totalMinutesB = hoursB * 60 + minutesB
    
    return totalMinutesA - totalMinutesB
  }

  addNewClass(): void {
    this.router.navigate(['/admin/mobile/classes/add-class'])
  }

  get filteredActiveClasses(): Class[] {
    const selectedClassType = this.filterForm.get('classType')?.value
    const selectedLocation = this.filterForm.get('location')?.value
    
    return this.activeClasses.filter(class_ => {
      const matchesType = selectedClassType === 'ALL' || class_.classType === selectedClassType
      const matchesLocation = selectedLocation === 'ALL' || class_.classLocation === selectedLocation
      return matchesType && matchesLocation
    })
  }

  get filteredTerminatedClasses(): Class[] {
    const selectedClassType = this.filterForm.get('classType')?.value
    const selectedLocation = this.filterForm.get('location')?.value
    
    return this.terminatedClasses.filter(class_ => {
      const matchesType = selectedClassType === 'ALL' || class_.classType === selectedClassType
      const matchesLocation = selectedLocation === 'ALL' || class_.classLocation === selectedLocation
      return matchesType && matchesLocation
    })
  }

  get classesGrouped(): Map<ClassType, Map<string, Class[]>> | undefined {
    return this.filteredActiveClasses.reduce((typeMap, class_) => {
      if (!typeMap.has(class_.classType)) {
        typeMap.set(class_.classType, new Map<string, Class[]>());
      }
      
      const locationMap = typeMap.get(class_.classType)!;
      
      const locationClasses = locationMap.get(class_.classLocation) || [];
      locationClasses.push(class_);
      locationMap.set(class_.classLocation, locationClasses);
   
      return typeMap;
    }, new Map<ClassType, Map<string, Class[]>>());
  }

  get terminatedClassesGrouped(): Map<ClassType, Map<string, Class[]>> | undefined {
    return this.filteredTerminatedClasses.reduce((typeMap, class_) => {
      if (!typeMap.has(class_.classType)) {
        typeMap.set(class_.classType, new Map<string, Class[]>());
      }
      
      const locationMap = typeMap.get(class_.classType)!;
      
      const locationClasses = locationMap.get(class_.classLocation) || [];
      locationClasses.push(class_);
      locationMap.set(class_.classLocation, locationClasses);
   
      return typeMap;
    }, new Map<ClassType, Map<string, Class[]>>());
  }
}