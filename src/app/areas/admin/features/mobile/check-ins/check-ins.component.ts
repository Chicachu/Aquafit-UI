import {

  Component,

  HostBinding,

  OnDestroy,

  OnInit,

  ChangeDetectorRef,

} from "@angular/core";

import { FormBuilder, FormGroup, Validators } from "@angular/forms";

import { ActivatedRoute } from "@angular/router";

import { Subscription } from "rxjs";

import { ButtonType } from "../breadcrumb-nav-bar/breadcrumb-nav-bar.component";

import { CheckInRefreshService } from "@core/services/checkInRefreshService";

import { CheckInService, CheckInType, EmployeeCheckIn } from "@core/services/checkInService";

import { SnackBarService } from "@core/services/snackBarService";

import { TranslateService } from "@ngx-translate/core";

import { UserService } from "@core/services/userService";

import { User } from "@core/types/user";

import {

  CheckInValidationCode,

  validateCheckInEntry,

} from "@shared/utils/checkInValidation";



@Component({

  selector: "app-check-ins",

  templateUrl: "./check-ins.component.html",

  styleUrls: ["./check-ins.component.scss"],

})

export class CheckInsComponent implements OnInit, OnDestroy {

  @HostBinding('class.panel-view') panelView = false;



  ButtonType = ButtonType;

  CheckInType = CheckInType;



  userId: string | null = null;

  employee: User | null = null;

  simulateForm!: FormGroup;

  entries: EmployeeCheckIn[] = [];

  isLoadingEntries = false;

  isSubmitting = false;



  private routeSubscription?: Subscription;

  private formSubscription?: Subscription;

  private refreshSubscription?: Subscription;



  get buttonType(): ButtonType {

    return ButtonType.NONE;

  }



  get employeeName(): string {

    if (!this.employee) {

      return '';

    }



    return `${this.employee.firstName} ${this.employee.lastName}`.trim();

  }



  get staffEmployeeNumber(): string | null {

    return this._formatEmployeeNumber(this.employee?.employeeId);

  }



  get missingEmployeeId(): boolean {

    return this.panelView && !!this.employee && !this.staffEmployeeNumber;

  }



  get canCheckIn(): boolean {

    return this._canSubmitType(CheckInType.CHECK_IN);

  }



  get canCheckOut(): boolean {

    return this._canSubmitType(CheckInType.CHECK_OUT);

  }



  constructor(

    private fb: FormBuilder,

    private route: ActivatedRoute,

    private checkInService: CheckInService,

    private checkInRefreshService: CheckInRefreshService,

    private snackBarService: SnackBarService,

    private translateService: TranslateService,

    private userService: UserService,

    private cdr: ChangeDetectorRef

  ) {}



  ngOnInit(): void {

    this.panelView = this.route.snapshot.data['panelView'] === true;



    const now = new Date();

    const timeStr = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;

    this.simulateForm = this.fb.group({

      employeeNumber: ["", this.panelView ? [] : [Validators.required, Validators.pattern(/^\d{6}$/)]],

      simulatedDate: [new Date(), Validators.required],

      simulatedTime: [timeStr, [Validators.required, Validators.pattern(/^\d{1,2}:\d{2}(:\d{2})?$/)]],

    });



    this.formSubscription = this.simulateForm.valueChanges.subscribe(() => {

      this.cdr.markForCheck();

    });



    this.refreshSubscription = this.checkInRefreshService.refresh$.subscribe((employeeNumber) => {

      if (employeeNumber === this._getActiveEmployeeNumber()) {

        this._loadEntries(false);

      }

    });



    if (this.panelView) {

      this.routeSubscription = this.route.paramMap.subscribe((params) => {

        this.userId = params.get('user-id');

        this._loadEmployee();

      });

      return;

    }



    this.simulateForm.get('employeeNumber')?.valueChanges.subscribe((value) => {

      const emp = String(value ?? '').trim();

      if (/^\d{6}$/.test(emp)) {

        this._loadEntries(false);

        return;

      }



      this.entries = [];

      this.cdr.markForCheck();

    });

  }



  ngOnDestroy(): void {

    this.routeSubscription?.unsubscribe();

    this.formSubscription?.unsubscribe();

    this.refreshSubscription?.unsubscribe();

  }



  get simulatedDateTime(): Date {

    const d = this.simulateForm?.get("simulatedDate")?.value as Date | null;

    const t = this.simulateForm?.get("simulatedTime")?.value as string | null;

    if (!d || !t) return new Date();

    const [h, m] = (t || "0:0").split(":").map((n) => parseInt(n, 10) || 0);

    const out = new Date(d);

    out.setHours(h, m, 0, 0);

    return out;

  }



  loadEntries(): void {

    const emp = this._getActiveEmployeeNumber();

    if (!emp) {

      this.snackBarService.showError(

        this.translateService.instant("ERRORS.REQUIRED", { field: this.translateService.instant("CHECK_INS.EMPLOYEE_NUMBER") })

      );

      return;

    }



    this._loadEntries(true);

  }



  submitCheckIn(): void {

    if (!this.canCheckIn) {

      this._showValidationError(CheckInType.CHECK_IN);

      return;

    }



    this._submitEntry(CheckInType.CHECK_IN, "CHECK_INS.CHECK_IN_SUCCESS");

  }



  submitCheckOut(): void {

    if (!this.canCheckOut) {

      this._showValidationError(CheckInType.CHECK_OUT);

      return;

    }



    this._submitEntry(CheckInType.CHECK_OUT, "CHECK_INS.CHECK_OUT_SUCCESS");

  }



  private _canSubmitType(type: CheckInType): boolean {

    if (this.isSubmitting || this.simulateForm?.valid !== true) {

      return false;

    }



    const emp = this._getActiveEmployeeNumber();

    if (!emp) {

      return false;

    }



    return validateCheckInEntry(this.entries, type, this.simulatedDateTime).valid;

  }



  private _showValidationError(type: CheckInType): void {

    const result = validateCheckInEntry(this.entries, type, this.simulatedDateTime);

    if (result.valid || !result.code) {

      return;

    }



    this.snackBarService.showError(this.translateService.instant(this._validationMessageKey(result.code)));

  }



  private _validationMessageKey(code: CheckInValidationCode): string {

    switch (code) {

      case CheckInValidationCode.OPEN_CHECK_IN:

        return 'CHECK_INS.CHECK_IN_OPEN_SESSION';

      case CheckInValidationCode.COOLDOWN_AFTER_CHECK_OUT:

        return 'CHECK_INS.CHECK_IN_COOLDOWN_AFTER_CHECK_OUT';

      case CheckInValidationCode.NO_OPEN_CHECK_IN:

        return 'CHECK_INS.CHECK_OUT_NO_OPEN_CHECK_IN';

      case CheckInValidationCode.COOLDOWN_AFTER_CHECK_IN:

        return 'CHECK_INS.CHECK_OUT_COOLDOWN_AFTER_CHECK_IN';

      default:

        return 'CHECK_INS.SUBMIT_ERROR';

    }

  }



  private _submitEntry(type: CheckInType, successKey: string): void {

    const emp = this._getActiveEmployeeNumber();

    if (!emp) {

      return;

    }



    const date = this.simulatedDateTime;

    this.isSubmitting = true;

    this.checkInService.createEntry(emp, type, date).subscribe({

      next: () => {

        this.snackBarService.showSuccess(this.translateService.instant(successKey));

        this.isSubmitting = false;

        this._loadEntries(false);

        if (this.panelView) {

          this.checkInRefreshService.notifyEntriesChanged(emp);

        }

        this.cdr.detectChanges();

      },

      error: (err) => {

        this.snackBarService.showError(

          err?.error?.message ?? this.translateService.instant("CHECK_INS.SUBMIT_ERROR")

        );

        this.isSubmitting = false;

        this.cdr.detectChanges();

      },

    });

  }



  private _loadEmployee(): void {

    if (!this.userId) {

      this.employee = null;

      this.entries = [];

      return;

    }



    this.userService.getUser(this.userId).subscribe({

      next: (user) => {

        this.employee = user;

        const employeeNumber = this._formatEmployeeNumber(user.employeeId);

        if (employeeNumber) {

          this.simulateForm.patchValue({ employeeNumber });

          this._loadEntries(false);

        } else {

          this.entries = [];

        }

        this.cdr.detectChanges();

      },

      error: (err) => {

        this.employee = null;

        this.entries = [];

        this.snackBarService.showError(err?.error?.message ?? '');

        this.cdr.detectChanges();

      },

    });

  }



  private _loadEntries(showErrors: boolean): void {

    const emp = this._getActiveEmployeeNumber();

    if (!emp) {

      return;

    }



    this.isLoadingEntries = true;

    this.checkInService.getEntriesByEmployeeId(emp).subscribe({

      next: (entries) => {

        this.entries = entries;

        this.isLoadingEntries = false;

        this.cdr.detectChanges();

      },

      error: (err) => {

        if (showErrors) {

          this.snackBarService.showError(

            err?.error?.message ?? this.translateService.instant("CHECK_INS.LOAD_ENTRIES_ERROR")

          );

        }

        this.isLoadingEntries = false;

        this.cdr.detectChanges();

      },

    });

  }



  private _getActiveEmployeeNumber(): string | null {

    if (this.panelView) {

      return this.staffEmployeeNumber;

    }



    const emp = this.simulateForm.get("employeeNumber")?.value?.trim();

    return emp || null;

  }



  private _formatEmployeeNumber(employeeId: number | null | undefined): string | null {

    if (employeeId == null) {

      return null;

    }



    return String(employeeId).padStart(6, '0');

  }

}


