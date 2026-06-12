import { Component, HostBinding, Input, OnDestroy, OnInit } from "@angular/core";
import { User } from "@core/types/user";
import { UserService } from "@core/services/userService";
import { SnackBarService } from "@core/services/snackBarService";
import { ButtonType } from "../../breadcrumb-nav-bar/breadcrumb-nav-bar.component";
import { Role } from "@core/types/enums/role";
import { ActivatedRoute, NavigationEnd, Router } from "@angular/router";
import { filter, forkJoin, Subscription } from "rxjs";

@Component({
  selector: 'app-employees-list',
  templateUrl: './employees-list.component.html',
  styleUrls: ['./employees-list.component.scss']
})
export class EmployeesListComponent implements OnInit, OnDestroy {
  @Input() showBreadcrumb = true
  @Input() @HostBinding('class.panel-view') panelView = false

  ButtonType = ButtonType
  instructors: User[] = []
  managers: User[] = []
  receptionists: User[] = []
  employees: User[] = []
  selectedEmployeeId: string | null = null
  employeesLoaded = false

  private subscriptions = new Subscription()

  get canAddEmployee(): boolean {
    return this.userService.isAdmin || this.userService.isManager
  }

  get hasNoEmployees(): boolean {
    return this.employeesLoaded
      && this.instructors.length === 0
      && this.managers.length === 0
      && this.receptionists.length === 0
      && this.employees.length === 0
  }

  constructor(
    private userService: UserService,
    private snackBarService: SnackBarService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this._loadEmployees()

    if (this.panelView) {
      this._updateSelectedEmployeeId()
      this.subscriptions.add(
        this.router.events.pipe(
          filter((event): event is NavigationEnd => event instanceof NavigationEnd)
        ).subscribe(() => {
          this._updateSelectedEmployeeId()
          this._loadEmployees()
        })
      )
    }
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe()
  }

  isEmployeeSelected(employeeId: string): boolean {
    return this.panelView && this.selectedEmployeeId === employeeId
  }

  getEmployeeDetailsLink(employeeId: string): string[] {
    if (this.panelView) {
      return ['/admin/employees', employeeId, 'details']
    }

    return ['/admin/mobile/employees', employeeId, 'details']
  }

  addNewEmployee(): void {
    if (this.panelView) {
      this.router.navigate(['/admin/employees/add'])
      return
    }

    this.router.navigate(['/admin/mobile/employees/add'])
  }

  private _updateSelectedEmployeeId(): void {
    this.selectedEmployeeId = this._findEmployeeIdInRouteTree(this.route)
  }

  private _findEmployeeIdInRouteTree(route: ActivatedRoute): string | null {
    const userId = route.snapshot.paramMap.get('user-id')
    if (userId) {
      return userId
    }

    if (route.firstChild) {
      return this._findEmployeeIdInRouteTree(route.firstChild)
    }

    return null
  }

  private _loadEmployees(): void {
    forkJoin({
      instructors: this.userService.getAllUsers(Role.INSTRUCTOR),
      managers: this.userService.getAllUsers(Role.MANAGER),
      receptionists: this.userService.getAllUsers(Role.RECEPTIONIST),
      employees: this.userService.getAllUsers(Role.EMPLOYEE)
    }).subscribe({
      next: ({ instructors, managers, receptionists, employees }) => {
        const sortUsers = (a: User, b: User) => {
          if (a.firstName < b.firstName) return -1
          if (b.firstName < a.firstName) return 1
          return 0
        }

        this.instructors = instructors.sort(sortUsers)
        this.managers = managers.sort(sortUsers)
        this.receptionists = receptionists.sort(sortUsers)
        this.employees = employees.sort(sortUsers)
        this.employeesLoaded = true
      },
      error: ({ error }) => {
        this.snackBarService.showError(error?.message ?? '')
      }
    })
  }
}
