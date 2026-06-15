import { Component, HostBinding, OnDestroy, OnInit } from "@angular/core";
import { ButtonType } from "../../breadcrumb-nav-bar/breadcrumb-nav-bar.component";
import { ActivatedRoute, NavigationEnd, Router } from "@angular/router";
import { distinctUntilChanged, filter, map } from "rxjs/operators";
import { Subscription } from "rxjs";
import { UserService } from "@core/services/userService";
import { ScheduleService } from "@core/services/scheduleService";
import { User, Note } from "@core/types/user";
import { SnackBarService } from "@core/services/snackBarService";
import { TranslateService } from "@ngx-translate/core";
import { Role } from "@core/types/enums/role";
import { EmployeeClassDetails } from "@core/types/employees/employeeClassDetails";
import { Class } from "@core/types/classes/class";
import { Assignment } from "@core/types/assignment";
import { ClassType } from "@core/types/enums/classType";
import { AssignmentStatus } from "@core/types/enums/assignmentStatus";
import { AssignmentService } from "@core/services/assignmentService";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";

@Component({
  selector: "app-employee-details",
  templateUrl: "./employee-details.component.html",
  styleUrls: ["./employee-details.component.scss"],
})
export class EmployeeDetailsComponent implements OnInit, OnDestroy {
  @HostBinding('class.panel-view') panelView = false

  readonly ClassType = ClassType;
  readonly AssignmentStatus = AssignmentStatus;
  readonly Role = Role;
  ButtonType = ButtonType;

  employeeId: string | null = null;
  employee: User | null = null;
  canEditEmployee = false;

  showAssignmentModal = false;
  showUnassignModal = false;
  unassignButtons = [{ text: "CONTROLS.CANCEL" }, { text: "EMPLOYEES.UNASSIGN" }];
  unassignForm: FormGroup;
  selectedAssignmentForUnassign: { class: Class; assignment: Assignment } | null = null;

  assignmentInfo: { class: Class; assignment: Assignment }[] = [];
  activeAssignmentInfo: { class: Class; assignment: Assignment }[] = [];
  pastAssignmentInfo: { class: Class; assignment: Assignment }[] = [];
  terminatedAssignmentInfo: { class: Class; assignment: Assignment }[] = [];

  private routeSubscription?: Subscription
  private routerSubscription?: Subscription

  constructor(
    private route: ActivatedRoute,
    public userService: UserService,
    private snackBarService: SnackBarService,
    private translateService: TranslateService,
    private router: Router,
    private fb: FormBuilder,
    private assignmentService: AssignmentService,
    private scheduleService: ScheduleService
  ) {
    this.unassignForm = this.fb.group({
      end_date: ["", [Validators.required]],
    });
  }

  get unassignMinDate(): Date | null {
    const a = this.selectedAssignmentForUnassign?.assignment?.startDate;
    return a ? new Date(a) : null;
  }

  get canViewPaymentDetails(): boolean {
    if (!this.employee || this.employee.role !== Role.INSTRUCTOR) return false;
    return (
      this.userService.isAdmin ||
      this.userService.isManager ||
      this.userService.isReceptionist ||
      this.userService.user?._id === this.employee._id
    );
  }

  get assignmentsGrouped(): Map<ClassType, Map<string, { class: Class; assignment: Assignment }[]>> | undefined {
    return this.activeAssignmentInfo?.reduce(
      (typeMap, item) => {
        const { class: classObj } = item;
        if (!typeMap.has(classObj.classType)) {
          typeMap.set(classObj.classType, new Map<string, { class: Class; assignment: Assignment }[]>());
        }
        const locationMap = typeMap.get(classObj.classType)!;
        const locationKey = classObj.classLocation;
        const locationAssignments = locationMap.get(locationKey) || [];
        locationAssignments.push(item);
        locationMap.set(locationKey, locationAssignments);
        return typeMap;
      },
      new Map<ClassType, Map<string, { class: Class; assignment: Assignment }[]>>()
    );
  }

  get pastAssignmentsGrouped(): Map<ClassType, Map<string, { class: Class; assignment: Assignment }[]>> | undefined {
    return this.pastAssignmentInfo?.reduce(
      (typeMap, item) => {
        const { class: classObj } = item;
        if (!typeMap.has(classObj.classType)) {
          typeMap.set(classObj.classType, new Map<string, { class: Class; assignment: Assignment }[]>());
        }
        const locationMap = typeMap.get(classObj.classType)!;
        const locationKey = classObj.classLocation;
        const locationAssignments = locationMap.get(locationKey) || [];
        locationAssignments.push(item);
        locationMap.set(locationKey, locationAssignments);
        return typeMap;
      },
      new Map<ClassType, Map<string, { class: Class; assignment: Assignment }[]>>()
    );
  }

  get terminatedAssignmentsGrouped(): Map<ClassType, Map<string, { class: Class; assignment: Assignment }[]>> | undefined {
    return this.terminatedAssignmentInfo?.reduce(
      (typeMap, item) => {
        const { class: classObj } = item;
        if (!typeMap.has(classObj.classType)) {
          typeMap.set(classObj.classType, new Map<string, { class: Class; assignment: Assignment }[]>());
        }
        const locationMap = typeMap.get(classObj.classType)!;
        const locationKey = classObj.classLocation;
        const locationAssignments = locationMap.get(locationKey) || [];
        locationAssignments.push(item);
        locationMap.set(locationKey, locationAssignments);
        return typeMap;
      },
      new Map<ClassType, Map<string, { class: Class; assignment: Assignment }[]>>()
    );
  }

  ngOnInit(): void {
    if (this.route.snapshot.data['panelView'] === true) {
      this.panelView = true
    }

    this.canEditEmployee = this.userService.isAdmin || this.userService.isManager;

    this.routeSubscription = this._getUserIdRoute().paramMap.pipe(
      map(params => params.get('user-id')),
      distinctUntilChanged()
    ).subscribe(userId => {
      if (!userId) {
        return
      }

      this._loadEmployeeDetails(userId)
    })

    if (this.panelView) {
      this.routerSubscription = this.router.events.pipe(
        filter((event): event is NavigationEnd => event instanceof NavigationEnd)
      ).subscribe(() => {
        if (this.employeeId && this._employeeCanHaveClassAssignments(this.employee?.role)) {
          this._loadClassDetails()
        }
      })
    }
  }

  ngOnDestroy(): void {
    this.routeSubscription?.unsubscribe()
    this.routerSubscription?.unsubscribe()
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

  private _employeeCanHaveClassAssignments(role: Role | undefined): boolean {
    return role === Role.INSTRUCTOR || role === Role.MANAGER
  }

  private _loadEmployeeDetails(userId: string): void {
    this.employeeId = userId

    this.userService.getUser(userId).subscribe({
      next: (user: User) => {
        this.employee = user;
        if (this._employeeCanHaveClassAssignments(this.employee?.role)) {
          this._loadClassDetails();
        } else {
          this.assignmentInfo = []
          this.activeAssignmentInfo = []
          this.pastAssignmentInfo = []
          this.terminatedAssignmentInfo = []
        }
      },
      error: ({ error }) => {
        this.snackBarService.showError(error?.message ?? "");
      },
    });
  }

  getPaymentLink(): string[] {
    if (!this.employeeId) {
      return []
    }

    return this.panelView
      ? ['/admin/employees', this.employeeId, 'payments']
      : ['/admin/mobile/employees', this.employeeId, 'payments']
  }

  getClassDetailsLink(classId: string | undefined): string[] {
    if (!classId) {
      return []
    }

    return this.panelView
      ? ['/admin/classes', classId, 'details']
      : ['/admin/mobile/classes', classId, 'details']
  }

  private _loadClassDetails(): void {
    if (!this.employeeId) return;
    this.scheduleService.getEmployeeClassDetails(this.employeeId).subscribe({
      next: (details: EmployeeClassDetails) => {
        this.assignmentInfo = details.assignmentInfo ?? [];
        this._separateActiveAndTerminated(this.assignmentInfo);
      },
      error: ({ error }) => {
        this.snackBarService.showError(error?.message ?? "");
      },
    });
  }

  private _separateActiveAndTerminated(assignmentInfo: { class: Class; assignment: Assignment }[]): void {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    this.activeAssignmentInfo = [];
    this.pastAssignmentInfo = [];
    this.terminatedAssignmentInfo = [];

    assignmentInfo.forEach((item) => {
      if (!item.class) return;
      const isUnassigned = item.assignment.status === AssignmentStatus.UNASSIGNED;
      let classEnded = false;
      if (item.class.endDate) {
        const d = new Date(item.class.endDate);
        d.setHours(0, 0, 0, 0);
        classEnded = d <= today;
      }
      if (isUnassigned) {
        this.pastAssignmentInfo.push(item);
      } else if (classEnded) {
        this.terminatedAssignmentInfo.push(item);
      } else {
        this.activeAssignmentInfo.push(item);
      }
    });
  }

  editEmployee(): void {
    if (this.employeeId) {
      if (this.panelView) {
        this.router.navigate(['/admin/employees', this.employeeId, 'edit'])
        return
      }

      this.router.navigate(["/admin/mobile/employees", this.employeeId, "edit"]);
    }
  }

  onNotesUpdated(notes: Note[]): void {
    if (this.employee) {
      this.employee.notes = notes;
    }
  }

  setShowAssignmentModal(): void {
    if (!this.employee) return;

    if (this.panelView && this.employeeId) {
      this.router.navigate(['/admin/employees', this.employeeId, 'details', 'assign'])
      return
    }

    this.showAssignmentModal = true;
  }

  onAssignmentModalClick(event: { ref: EmployeeDetailsComponent; buttonTitle: string }): void {
    if (event.buttonTitle === 'close-button') {
      this.closeAssignmentModal()
    }
  }

  closeAssignmentModal(): void {
    this.showAssignmentModal = false
  }

  onEmployeeAssigned(): void {
    this._loadClassDetails()
    this.closeAssignmentModal()
  }

  setShowUnassignModal(classAndAssignment: { class: Class; assignment: Assignment }): void {
    this.selectedAssignmentForUnassign = classAndAssignment;
    this.unassignForm.reset();
    this.showUnassignModal = true;
  }

  processUnassignModalClick(event: { ref: EmployeeDetailsComponent; buttonTitle: string }): void {
    if (event.buttonTitle === "CONTROLS.CANCEL" || event.buttonTitle === "close-button") {
      this.unassignForm.reset();
      this.showUnassignModal = false;
      this.selectedAssignmentForUnassign = null;
    } else if (event.buttonTitle === "EMPLOYEES.UNASSIGN") {
      if (!this.selectedAssignmentForUnassign) return;
      const raw = this.unassignForm.get("end_date")?.value;
      const endDate = raw?._d ? new Date(raw._d) : raw ? new Date(raw) : null;
      if (!endDate) {
        this.snackBarService.showError(this.translateService.instant("ERRORS.REQUIRED", { field: this.translateService.instant("ERRORS.END_DATE") }));
        return;
      }
      this.assignmentService
        .updateAssignment(this.selectedAssignmentForUnassign.assignment._id!, { endDate })
        .subscribe({
          next: () => {
            if (this.employeeId) {
              this.scheduleService.invalidateEmployeeClassDetails(this.employeeId);
            }
            this._loadClassDetails();
            this.snackBarService.showSuccess(this.translateService.instant("EMPLOYEES.UNASSIGN_SUCCESS"));
            this.showUnassignModal = false;
            this.selectedAssignmentForUnassign = null;
            this.unassignForm.reset();
          },
          error: ({ error }) => {
            this.snackBarService.showError(error?.message ?? this.translateService.instant('ERRORS.UPDATE_ASSIGNMENT'));
          },
        });
    }
  }
}
