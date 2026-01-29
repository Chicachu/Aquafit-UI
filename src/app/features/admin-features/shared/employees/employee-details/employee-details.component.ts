import { Component } from "@angular/core";
import { ButtonType } from "../../breadcrumb-nav-bar/breadcrumb-nav-bar.component";
import { ActivatedRoute, Router } from "@angular/router";
import { UserService } from "@core/services/userService";
import { User, Note } from "@core/types/user";
import { SnackBarService } from "@core/services/snackBarService";
import { TranslateService } from "@ngx-translate/core";
import { Role } from "@core/types/enums/role";
import { EmployeeClassDetails } from "@core/types/employees/employeeClassDetails";
import { Class } from "@core/types/classes/class";
import { Assignment } from "@core/types/assignment";
import { ClassType } from "@core/types/enums/classType";
import { AssignmentStatus } from "@core/types/enums/assignmentStatus";
import { ClassService } from "@core/services/classService";
import { AssignmentService } from "@core/services/assignmentService";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { ClassScheduleMap } from "@core/types/classScheduleMap";
import { SelectOption } from "@core/types/selectOption";
import { forkJoin } from "rxjs";

@Component({
  selector: "app-employee-details",
  templateUrl: "./employee-details.component.html",
  styleUrls: ["./employee-details.component.scss"],
})
export class EmployeeDetailsComponent {
  readonly ClassType = ClassType;
  readonly AssignmentStatus = AssignmentStatus;
  readonly Role = Role;
  ButtonType = ButtonType;

  employeeId: string | null = null;
  employee: User | null = null;
  canEditEmployee = false;

  showAssignmentModal = false;
  assignmentButtons = [{ text: "CONTROLS.CANCEL" }, { text: "EMPLOYEES.ASSIGN_INSTRUCTOR" }];
  showUnassignModal = false;
  unassignButtons = [{ text: "CONTROLS.CANCEL" }, { text: "EMPLOYEES.UNASSIGN" }];
  unassignForm: FormGroup;
  selectedAssignmentForUnassign: { class: Class; assignment: Assignment } | null = null;

  assignmentInfo: { class: Class; assignment: Assignment }[] = [];
  activeAssignmentInfo: { class: Class; assignment: Assignment }[] = [];
  pastAssignmentInfo: { class: Class; assignment: Assignment }[] = [];
  terminatedAssignmentInfo: { class: Class; assignment: Assignment }[] = [];

  classSelectionForm: FormGroup;
  classTypeOptions: SelectOption[] = [];
  selectedType: ClassType | null = null;
  classLocationOptions: SelectOption[] = [];
  selectedLocation = "";
  classTimesOptions: SelectOption[] = [];
  classScheduleMap: ClassScheduleMap | null = null;
  classIdsWithActiveAssignment: Set<string> = new Set();
  selectedClassId = "";
  selectedClassDays: number[] | null = null;

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
      class_type: ["", [Validators.required]],
      location: ["", [Validators.required]],
      time: ["", [Validators.required]],
      start_date: ["", [Validators.required]],
    });
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
      this.userService.user?._id === this.employee._id
    );
  }

  get f() {
    return this.classSelectionForm.controls;
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

  /**
   * Groups past (unassigned) assignments by ClassType → location → list of { class, assignment }.
   * Uses status only; cron job sets status from endDate.
   */
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

  /**
   * Groups terminated-class assignments by ClassType → location. Only when the class itself
   * was terminated (class.endDate). Unassigned assignments go to Past, not here.
   */
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
    this.canEditEmployee = this.userService.isAdmin;
    const userId = this.route.snapshot.paramMap.get("user-id");
    this.employeeId = userId;

    this._setupAssignModalFormSubscriptions();

    this.userService.getUser(userId!).subscribe({
      next: (user: User) => {
        this.employee = user;
        if (this.employee?.role === Role.INSTRUCTOR) {
          this._loadClassDetails();
        }
      },
      error: ({ error }) => {
        this.snackBarService.showError(error?.message ?? "");
      },
    });
  }

  private _loadClassDetails(): void {
    if (!this.employeeId) return;
    this.userService.getEmployeeClassDetails(this.employeeId).subscribe({
      next: (details: EmployeeClassDetails) => {
        this.assignmentInfo = details.assignmentInfo ?? [];
        this._separateActiveAndTerminated(this.assignmentInfo);
      },
      error: ({ error }) => {
        this.snackBarService.showError(error?.message ?? "");
      },
    });
  }

  /**
   * Uses status only to decide where assignments belong. The cron job checks endDate
   * and sets status to UNASSIGNED; project code must not check endDate.
   * - Active (Classes Teaching): status not UNASSIGNED, class not ended.
   * - Past assignments: status === UNASSIGNED.
   * - Terminated Classes: class ended (class.endDate in past), status not UNASSIGNED.
   *   Unassigned never go here.
   */
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

  private _getAssignedClassIds(): Set<string> {
    return this.classIdsWithActiveAssignment;
  }

  editEmployee(): void {
    if (this.employeeId) {
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

    this.classSelectionForm.reset();
    this.selectedType = null;
    this.selectedLocation = "";
    this.selectedClassId = "";
    this.selectedClassDays = null;
    this.classLocationOptions = [];
    this.classTimesOptions = [];
    this.classIdsWithActiveAssignment = new Set();

    forkJoin({
      classScheduleMap: this.classService.getClassScheduleMap(),
      classIds: this.assignmentService.getClassIdsWithActiveAssignments(),
    }).subscribe({
      next: ({ classScheduleMap, classIds }) => {
        if (classScheduleMap) {
          this.classScheduleMap = classScheduleMap;
          this.classIdsWithActiveAssignment = new Set(classIds);
          this.classTypeOptions = Object.keys(classScheduleMap).map((classType) => ({
            viewValue: classType,
            value: classType,
          }));
          this.showAssignmentModal = true;
        }
      },
      error: ({ error }) => {
        this.snackBarService.showError(error?.message ?? "");
      },
    });
  }

  processAssignmentModalClick(event: { ref: EmployeeDetailsComponent; buttonTitle: string }): void {
    if (event.buttonTitle === "CONTROLS.CANCEL" || event.buttonTitle === "close-button") {
      this.classSelectionForm.reset();
      this.selectedType = null;
      this.selectedLocation = "";
      this.selectedClassId = "";
      this.selectedClassDays = null;
      this.classLocationOptions = [];
      this.classTimesOptions = [];
      this.showAssignmentModal = false;
    } else if (event.buttonTitle === "EMPLOYEES.ASSIGN_INSTRUCTOR") {
      const raw = this.f["start_date"].value;
      const startDate = raw?._d ? new Date(raw._d) : raw ? new Date(raw) : null;
      if (!startDate || !this.employeeId || !this.selectedClassId) {
        this.snackBarService.showError(this.translateService.instant("ERRORS.REQUIRED", { field: "Start date" }));
        return;
      }
      this.assignmentService.assignInstructor(this.selectedClassId, this.employeeId, startDate).subscribe({
        next: () => {
          this.classSelectionForm.reset();
          this.selectedType = null;
          this.selectedLocation = "";
          this.selectedClassId = "";
          this.selectedClassDays = null;
          this.classLocationOptions = [];
          this.classTimesOptions = [];
          this._loadClassDetails();
          this.snackBarService.showSuccess(this.translateService.instant("EMPLOYEES.ASSIGN_SUCCESS"));
          this.showAssignmentModal = false;
        },
        error: ({ error }) => {
          this.snackBarService.showError(error?.message ?? "");
        },
      });
    }
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
        this.snackBarService.showError(this.translateService.instant("ERRORS.REQUIRED", { field: "End date" }));
        return;
      }
      this.assignmentService
        .updateAssignment(this.selectedAssignmentForUnassign.assignment._id!, { endDate })
        .subscribe({
          next: () => {
            this._loadClassDetails();
            this.snackBarService.showSuccess(this.translateService.instant("EMPLOYEES.UNASSIGN_SUCCESS"));
            this.showUnassignModal = false;
            this.selectedAssignmentForUnassign = null;
            this.unassignForm.reset();
          },
          error: ({ error }) => {
            this.snackBarService.showError(error?.message ?? "Error updating assignment.");
          },
        });
    }
  }

  private _setupAssignModalFormSubscriptions(): void {
    this.classSelectionForm.get("class_type")?.valueChanges.subscribe((selectedClassType: ClassType) => {
      if (!this.classScheduleMap) return;
      this.selectedType = selectedClassType;
      const locations = Object.keys(this.classScheduleMap[selectedClassType] || {});
      this.classLocationOptions = locations.map((loc) => ({ value: loc, viewValue: loc }));
      this.selectedLocation = "";
      this.selectedClassId = "";
      this.selectedClassDays = null;
      this.classSelectionForm.get("location")?.reset("", { emitEvent: false });
      this.classSelectionForm.get("time")?.reset("", { emitEvent: false });
    });

    this.classSelectionForm.get("location")?.valueChanges.subscribe((selectedLocation: string) => {
      if (!this.classScheduleMap || !this.selectedType) return;
      this.selectedLocation = selectedLocation;
      const timeMap = this.classScheduleMap[this.selectedType]?.[selectedLocation] || {};
      const assignedIds = this._getAssignedClassIds();
      this.classTimesOptions = Object.keys(timeMap)
        .filter((timeSlot) => {
          const classId = timeMap[timeSlot];
          return !assignedIds.has(classId);
        })
        .map((t) => ({ value: t, viewValue: t }));
      this.selectedClassId = "";
      this.selectedClassDays = null;
      this.classSelectionForm.get("time")?.reset("", { emitEvent: false });
    });

    this.classSelectionForm.get("time")?.valueChanges.subscribe((selectedTime: string) => {
      if (!this.classScheduleMap || !this.selectedType || !this.selectedLocation) return;
      this.selectedClassId = this.classScheduleMap[this.selectedType]?.[this.selectedLocation]?.[selectedTime]!;
      this.selectedClassDays = null;
      if (this.selectedClassId) {
        this.classService.getClass(this.selectedClassId).subscribe({
          next: (classDetails: Class) => {
            this.selectedClassDays = classDetails.days ?? null;
          },
          error: () => {
            this.selectedClassDays = null;
          },
        });
      }
    });
  }
}
