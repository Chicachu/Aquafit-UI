import { Component, Input, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { User } from "../../../../../core/types/user";
import { UserService } from "../../../../../core/services/userService";
import { SnackBarService } from "../../../../../core/services/snackBarService";
import { Router } from "@angular/router";
import { ButtonType } from "../../breadcrumb-nav-bar/breadcrumb-nav-bar.component";
import { Role } from "@core/types/enums/role";
import { EnrollmentService } from "../../../../../core/services/enrollmentService";
import { ClassService } from "../../../../../core/services/classService";
import { WaitlistService, WaitlistEntry } from "../../../../../core/services/waitlistService";
import { forkJoin } from "rxjs";
import { Enrollment } from "../../../../../core/types/enrollment";
import { Class } from "../../../../../core/types/classes/class";
import { SelectOption } from "../../../../../core/types/selectOption";
import { FormatOptions } from "../../../../../core/types/enums/formatOptions";

@Component({
  selector: 'app-client-list',
  templateUrl: './client-list.component.html',
  styleUrls: ['./client-list.component.scss']
})
export class ClientListComponent implements OnInit {
  ButtonType = ButtonType
  FormatOptions = FormatOptions
  @Input() title: string = ''
  activeClients: User[] | null = null
  inactiveClients: User[] | null = null
  allActiveClients: User[] = []
  allInactiveClients: User[] = []
  filterForm: FormGroup
  locationOptions: SelectOption[] = []
  userLocationsMap: Map<string, Set<string>> = new Map() // userId -> Set of locations
  activeEnrollments: Enrollment[] = []
  waitlistEntries: WaitlistEntry[] = []
  waitlistUsers: Map<string, User> = new Map() // userId -> User
  allClasses: Class[] = []

  constructor(
    private usersService: UserService,
    private snackBarService: SnackBarService,
    private router: Router,
    private enrollmentService: EnrollmentService,
    private classService: ClassService,
    private waitlistService: WaitlistService,
    private fb: FormBuilder
  ) {
    this.filterForm = this.fb.group({
      location: ['ALL']
    })
  }

  ngOnInit(): void {
    // Load clients, active enrollments, and classes in parallel
    forkJoin({
      users: this.usersService.getAllUsers(Role.CLIENT),
      activeEnrollments: this.enrollmentService.getAllActiveEnrollments(),
      classes: this.classService.getAllClasses()
    }).subscribe({
      next: ({ users, activeEnrollments, classes }) => {
        // Store enrollments and classes for filtering
        this.activeEnrollments = activeEnrollments
        this.allClasses = classes


        // Create a map of classId -> location
        const classLocationMap = new Map<string, string>()
        classes.forEach((classItem: Class) => {
          classLocationMap.set(classItem._id, classItem.classLocation)
        })

        // Create a map of userId -> Set of locations they have enrollments at
        this.userLocationsMap = new Map<string, Set<string>>()
        activeEnrollments.forEach((enrollment: Enrollment) => {
          const location = classLocationMap.get(enrollment.classId)
          if (location) {
            if (!this.userLocationsMap.has(enrollment.userId)) {
              this.userLocationsMap.set(enrollment.userId, new Set())
            }
            this.userLocationsMap.get(enrollment.userId)!.add(location)
          }
        })

        // Generate location options from unique locations in enrollments
        const uniqueLocations = new Set<string>()
        this.userLocationsMap.forEach((locations) => {
          locations.forEach(location => uniqueLocations.add(location))
        })

        this.locationOptions = [
          { value: 'ALL', viewValue: 'CLASSES.ALL_LOCATIONS' }
        ]
        Array.from(uniqueLocations).sort().forEach(location => {
          this.locationOptions.push({
            value: location,
            viewValue: location
          })
        })

        // Create a Set of userIds that have active enrollments
        const activeClientIds = new Set<string>(
          activeEnrollments.map((enrollment) => enrollment.userId)
        )

        // Separate clients into active and inactive
        const active: User[] = []
        const inactive: User[] = []

        users.forEach((user: User) => {
          if (activeClientIds.has(user._id)) {
            active.push(user)
          } else {
            inactive.push(user)
          }
        })

        // Sort both lists
        const sortUsers = (a: User, b: User) => {
          if (a.firstName < b.firstName) return -1
          if (b.firstName < a.firstName) return 1
          return 0
        }

        this.allActiveClients = active.sort(sortUsers)
        this.allInactiveClients = inactive.sort(sortUsers)
        
        // Load waitlist entries after classes are loaded so getClassDisplayName works
        // Then apply filters which will exclude waitlist-only users from inactive
        this._loadWaitlistEntries()
      },
      error: ({error}) => {
        this.snackBarService.showError(error.message)
      }
    })

    // Watch for filter changes
    this.filterForm.get('location')?.valueChanges.subscribe(() => {
      this._applyFilters()
    })
  }

  private _applyFilters(): void {
    const selectedLocation = this.filterForm.get('location')?.value

    // Create a Set of userIds that are on waitlists
    const waitlistUserIds = new Set<string>(this.waitlistEntries.map(e => e.userId))
    
    // Create a Set of userIds that have active enrollments
    const activeClientIds = new Set<string>(
      this.activeEnrollments.map((enrollment) => enrollment.userId)
    )

    // Filter inactive clients: exclude users who have no enrollments but are on a waitlist
    let filteredInactiveClients = this.allInactiveClients.filter(client => {
      // If user has enrollments, they're already in activeClients, so include in inactive
      // If user has NO enrollments but IS on waitlist, exclude from inactive
      // If user has NO enrollments and NOT on waitlist, include in inactive
      const hasEnrollments = activeClientIds.has(client._id)
      const isOnWaitlist = waitlistUserIds.has(client._id)
      
      // Exclude if: no enrollments AND on waitlist
      if (!hasEnrollments && isOnWaitlist) {
        return false
      }
      return true
    })

    if (selectedLocation === 'ALL') {
      this.activeClients = this.allActiveClients
      this.inactiveClients = filteredInactiveClients
      return
    }

    // Filter active clients - show only clients who have at least one enrollment at the selected location
    this.activeClients = this.allActiveClients.filter(client => {
      const userLocations = this.userLocationsMap.get(client._id)
      return userLocations && userLocations.has(selectedLocation)
    })

    // Inactive clients have no enrollments, so they don't belong to any location - only show them when "All" is selected
    this.inactiveClients = []
  }

  addNewClient(): void {
    this.router.navigate(['/admin/mobile/clients/add-client'])
  }

  private _loadWaitlistEntries(): void {
    this.waitlistService.getAllWaitlistEntries().subscribe({
      next: (entries: WaitlistEntry[]) => {
        // Sort by createdAt (oldest first)
        this.waitlistEntries = entries.sort((a, b) => {
          const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0
          const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0
          return dateA - dateB
        })
        
        // Load user data for waitlist entries
        const userIds = [...new Set(entries.map(e => e.userId))]
        if (userIds.length > 0) {
          forkJoin(userIds.map(id => this.usersService.getUser(id))).subscribe({
            next: (users: User[]) => {
              this.waitlistUsers.clear()
              users.forEach(user => {
                if (user && user._id) {
                  this.waitlistUsers.set(user._id, user)
                }
              })
              // After loading waitlist users, apply filters to exclude waitlist-only users from inactive
              this._applyFilters()
            },
            error: ({error}) => {
              this.snackBarService.showError(error.message)
            }
          })
        } else {
          // No waitlist entries, just apply filters
          this._applyFilters()
        }
      },
      error: ({error}) => {
        this.snackBarService.showError(error.message)
      }
    })
  }

  get deduplicatedWaitlistEntries(): Array<{userId: string, firstName: string, lastName: string, phoneNumber: string, classInfo: Array<{classId: string, className: string}>}> {
    // Group entries by userId (since same user can be on multiple class waitlists)
    const grouped = new Map<string, {userId: string, firstName: string, lastName: string, phoneNumber: string, classInfo: Array<{classId: string, className: string}>}>()
    
    this.waitlistEntries.forEach(entry => {
      const user = this.waitlistUsers.get(entry.userId)
      if (!user) return // Skip if user data not loaded yet
      
      if (!grouped.has(entry.userId)) {
        grouped.set(entry.userId, {
          userId: entry.userId,
          firstName: user.firstName,
          lastName: user.lastName,
          phoneNumber: user.phoneNumber || '',
          classInfo: []
        })
      }
      const classDisplayName = this.getClassDisplayName(entry.classId)
      const existing = grouped.get(entry.userId)!
      // Check if this classId is already in the list
      if (!existing.classInfo.some(info => info.classId === entry.classId)) {
        existing.classInfo.push({ classId: entry.classId, className: classDisplayName })
      }
    })
    
    return Array.from(grouped.values()).sort((a, b) => {
      if (a.firstName < b.firstName) return -1
      if (a.firstName > b.firstName) return 1
      if (a.lastName < b.lastName) return -1
      if (a.lastName > b.lastName) return 1
      return 0
    })
  }

  getClassDisplayName(classId: string): string {
    const classItem = this.allClasses.find(c => c._id === classId)
    if (!classItem) return classId
    const daysStr = classItem.days.map(d => ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][d]).join('/')
    return `${daysStr} - ${classItem.startTime} - ${classItem.classLocation}`
  }
}