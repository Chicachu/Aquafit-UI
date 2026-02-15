import {
  Component,
  OnInit,
  ChangeDetectorRef,
} from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { ButtonType } from "../breadcrumb-nav-bar/breadcrumb-nav-bar.component";
import { CheckInService, CheckInType, EmployeeCheckIn } from "@core/services/checkInService";
import { SnackBarService } from "@core/services/snackBarService";
import { TranslateService } from "@ngx-translate/core";

@Component({
  selector: "app-check-ins",
  templateUrl: "./check-ins.component.html",
  styleUrls: ["./check-ins.component.scss"],
})
export class CheckInsComponent implements OnInit {
  ButtonType = ButtonType;
  CheckInType = CheckInType;

  get buttonType(): ButtonType {
    return ButtonType.NONE;
  }

  simulateForm!: FormGroup;
  entries: EmployeeCheckIn[] = [];
  isLoadingEntries = false;
  isSubmitting = false;

  constructor(
    private fb: FormBuilder,
    private checkInService: CheckInService,
    private snackBarService: SnackBarService,
    private translateService: TranslateService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
    this.simulateForm = this.fb.group({
      employeeNumber: ["", [Validators.required, Validators.pattern(/^\d{6}$/)]],
      simulatedDate: [new Date(), Validators.required],
      simulatedTime: [timeStr, [Validators.required, Validators.pattern(/^\d{1,2}:\d{2}(:\d{2})?$/)]],
    });
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

  get canSubmit(): boolean {
    return !this.isSubmitting && this.simulateForm?.valid === true;
  }

  loadEntries(): void {
    const emp = this.simulateForm?.get("employeeNumber")?.value?.trim();
    if (!emp) {
      this.snackBarService.showError(
        this.translateService.instant("ERRORS.REQUIRED", { field: this.translateService.instant("CHECK_INS.EMPLOYEE_NUMBER") })
      );
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
        this.snackBarService.showError(
          err?.error?.message ?? this.translateService.instant("CHECK_INS.LOAD_ENTRIES_ERROR")
        );
        this.isLoadingEntries = false;
        this.cdr.detectChanges();
      },
    });
  }

  submitCheckIn(): void {
    if (!this.canSubmit) return;
    const emp = this.simulateForm.get("employeeNumber")!.value.trim();
    const date = this.simulatedDateTime;

    this.isSubmitting = true;
    this.checkInService.createEntry(emp, CheckInType.CHECK_IN, date).subscribe({
      next: () => {
        this.snackBarService.showSuccess(this.translateService.instant("CHECK_INS.CHECK_IN_SUCCESS"));
        this.isSubmitting = false;
        this.loadEntries();
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

  submitCheckOut(): void {
    if (!this.canSubmit) return;
    const emp = this.simulateForm.get("employeeNumber")!.value.trim();
    const date = this.simulatedDateTime;

    this.isSubmitting = true;
    this.checkInService.createEntry(emp, CheckInType.CHECK_OUT, date).subscribe({
      next: () => {
        this.snackBarService.showSuccess(this.translateService.instant("CHECK_INS.CHECK_OUT_SUCCESS"));
        this.isSubmitting = false;
        this.loadEntries();
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
}
