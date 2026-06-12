import { Component, HostBinding, Input, OnDestroy, OnInit } from "@angular/core";
import { FormBuilder, FormGroup } from "@angular/forms";
import { ActivatedRoute, NavigationEnd, Router } from "@angular/router";
import { filter, forkJoin, Subscription } from "rxjs";
import { User } from "@core/types/user";
import { UserService } from "@core/services/userService";
import { SnackBarService } from "@core/services/snackBarService";
import { ButtonType } from "../../breadcrumb-nav-bar/breadcrumb-nav-bar.component";
import { Role } from "@core/types/enums/role";
import { EnrollmentService } from "@core/services/enrollmentService";
import { ClassService } from "@core/services/classService";
import { WaitlistService, WaitlistEntry } from "@core/services/waitlistService";
import { Enrollment } from "@core/types/enrollment";
import { Class } from "@core/types/classes/class";
import { SelectOption } from "@core/types/selectOption";
import { FormatOptions } from "@core/types/enums/formatOptions";

@Component({
  selector: 'app-client-list',
  templateUrl: './client-list.component.html',
  styleUrls: ['./client-list.component.scss']
})
export class ClientListComponent implements OnInit, OnDestroy {
  @Input() showBreadcrumb = true
  @Input() @HostBinding('class.panel-view') panelView = false

  ButtonType = ButtonType
  FormatOptions = FormatOptions
  @Input() title: string = ''
  activeClients: User[] | null = null
  inactiveClients: User[] | null = null
  allActiveClients: User[] = []
  allInactiveClients: User[] = []
  filterForm: FormGroup
  locationOptions: SelectOption[] = []
  userLocationsMap: Map<string, Set<string>> = new Map()
  activeEnrollments: Enrollment[] = []
  waitlistEntries: WaitlistEntry[] = []
  waitlistUsers: Map<string, User> = new Map()
  allClasses: Class[] = []
  selectedClientId: string | null = null

  private subscriptions = new Subscription()

  constructor(
    private usersService: UserService,
    private snackBarService: SnackBarService,
    private router: Router,
    private route: ActivatedRoute,
    private enrollmentService: EnrollmentService,
    private classService: ClassService,
    private waitlistService: WaitlistService,
    private userService: UserService,
    private fb: FormBuilder
  ) {
    this.filterForm = this.fb.group({
      location: ['ALL']
    })
  }

  get canAddClient(): boolean {
    return this.userService.isAdmin
  }

  ngOnInit(): void {
    this._loadClients()

    this.subscriptions.add(
      this.filterForm.get('location')?.valueChanges.subscribe(() => {
        this._applyFilters()
      }) ?? new Subscription()
    )

    if (this.panelView) {
      this._updateSelectedClientId()
      this.subscriptions.add(
        this.router.events.pipe(
          filter((event): event is NavigationEnd => event instanceof NavigationEnd)
        ).subscribe(() => {
          this._updateSelectedClientId()
          this._loadClients()
        })
      )
    }
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe()
  }

  isClientSelected(clientId: string): boolean {
    return this.panelView && this.selectedClientId === clientId
  }

  getClassDetailsLink(classId: string): string[] {
    return this.panelView
      ? ['/admin/classes', classId, 'details']
      : ['../classes', classId, 'details']
  }

  getClientDetailsLink(clientId: string): string[] {
    if (this.panelView) {
      return ['/admin/clients', clientId, 'details']
    }

    return ['./', clientId, 'details']
  }

  addNewClient(): void {
    if (this.panelView) {
      this.router.navigate(['/admin/clients/add-client'])
      return
    }

    this.router.navigate(['/admin/mobile/clients/add-client'])
  }

  private _updateSelectedClientId(): void {
    this.selectedClientId = this._findClientIdInRouteTree(this.route)
  }

  private _findClientIdInRouteTree(route: ActivatedRoute): string | null {
    const userId = route.snapshot.paramMap.get('user-id')
    if (userId) {
      return userId
    }

    if (route.firstChild) {
      return this._findClientIdInRouteTree(route.firstChild)
    }

    return null
  }

  private _loadClients(): void {
    forkJoin({
      users: this.usersService.getAllUsers(Role.CLIENT),
      activeEnrollments: this.enrollmentService.getAllActiveEnrollments(),
      classes: this.classService.getAllClasses()
    }).subscribe({
      next: ({ users, activeEnrollments, classes }) => {
        this.activeEnrollments = activeEnrollments
        this.allClasses = classes

        const classLocationMap = new Map<string, string>()
        classes.forEach((classItem: Class) => {
          classLocationMap.set(classItem._id, classItem.classLocation)
        })

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

        const activeClientIds = new Set<string>(
          activeEnrollments.map((enrollment: Enrollment) => enrollment.userId)
        )

        const active: User[] = []
        const inactive: User[] = []

        users.forEach((user: User) => {
          if (activeClientIds.has(user._id)) {
            active.push(user)
          } else {
            inactive.push(user)
          }
        })

        const sortUsers = (a: User, b: User) => {
          if (a.firstName < b.firstName) return -1
          if (b.firstName < a.firstName) return 1
          return 0
        }

        this.allActiveClients = active.sort(sortUsers)
        this.allInactiveClients = inactive.sort(sortUsers)

        this._loadWaitlistEntries()
      },
      error: (err: { error?: { message?: string } }) => {
        this.snackBarService.showError(err.error?.message ?? '')
      }
    })
  }

  private _applyFilters(): void {
    const selectedLocation = this.filterForm.get('location')?.value

    const waitlistUserIds = new Set<string>(this.waitlistEntries.map(e => e.userId))

    const activeClientIds = new Set<string>(
      this.activeEnrollments.map((enrollment: Enrollment) => enrollment.userId)
    )

    let filteredInactiveClients = this.allInactiveClients.filter(client => {
      const hasEnrollments = activeClientIds.has(client._id)
      const isOnWaitlist = waitlistUserIds.has(client._id)

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

    this.activeClients = this.allActiveClients.filter(client => {
      const userLocations = this.userLocationsMap.get(client._id)
      return userLocations && userLocations.has(selectedLocation)
    })

    this.inactiveClients = []
  }

  private _loadWaitlistEntries(): void {
    this.waitlistService.getAllWaitlistEntries().subscribe({
      next: (entries: WaitlistEntry[]) => {
        this.waitlistEntries = entries.sort((a, b) => {
          const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0
          const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0
          return dateA - dateB
        })

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
              this._applyFilters()
            },
            error: (err: { error?: { message?: string } }) => {
              this.snackBarService.showError(err.error?.message ?? '')
            }
          })
        } else {
          this._applyFilters()
        }
      },
      error: (err: { error?: { message?: string } }) => {
        this.snackBarService.showError(err.error?.message ?? '')
      }
    })
  }

  get deduplicatedWaitlistEntries(): Array<{userId: string, firstName: string, lastName: string, phoneNumber: string, classInfo: Array<{classId: string, className: string}>}> {
    const grouped = new Map<string, {userId: string, firstName: string, lastName: string, phoneNumber: string, classInfo: Array<{classId: string, className: string}>}>()

    this.waitlistEntries.forEach(entry => {
      const user = this.waitlistUsers.get(entry.userId)
      if (!user) return

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
    const daysStr = classItem.days.map((d: number) => ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][d]).join('/')
    return `${daysStr} - ${classItem.startTime} - ${classItem.classLocation}`
  }
}
