import {
  Component,
  OnInit,
  ChangeDetectorRef,
} from "@angular/core";
import { ButtonType } from "../breadcrumb-nav-bar/breadcrumb-nav-bar.component";
import { UserService } from "@core/services/userService";
import { CheckInService, CheckInType, EmployeeCheckIn } from "@core/services/checkInService";
import { SnackBarService } from "@core/services/snackBarService";
import { TranslateService } from "@ngx-translate/core";
import { Role } from "@core/types/enums/role";
import * as QRCode from "qrcode";

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

  entries: EmployeeCheckIn[] = [];
  isLoadingEntries = false;
  isSubmitting = false;
  badgeQrUrl: string | null = null;
  showBadgeSection = false;

  constructor(
    private userService: UserService,
    private checkInService: CheckInService,
    private snackBarService: SnackBarService,
    private translateService: TranslateService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.updateBadgeQr();
    this.loadEntries();
  }

  get canShowBadge(): boolean {
    const role = this.userService.userRole;
    return role === Role.INSTRUCTOR || role === Role.EMPLOYEE;
  }

  get loggedInEmployeeId(): number | null {
    return this.userService.user?.employeeId ?? null;
  }

  get loggedInUserId(): string | null {
    return this.userService.user?._id ?? null;
  }

  private async updateBadgeQr(): Promise<void> {
    if (!this.canShowBadge || !this.loggedInEmployeeId) return;
    try {
      this.badgeQrUrl = await QRCode.toDataURL(String(this.loggedInEmployeeId), {
        width: 200,
        margin: 1,
      });
      this.showBadgeSection = true;
      this.cdr.detectChanges();
    } catch {
      this.badgeQrUrl = null;
    }
  }

  loadEntries(): void {
    this.isLoadingEntries = true;
    this.checkInService.getMyEntries().subscribe({
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
    const userId = this.loggedInUserId;
    if (!userId) {
      this.snackBarService.showError(
        this.translateService.instant("CHECK_INS.NOT_LOGGED_IN")
      );
      return;
    }

    this.isSubmitting = true;
    this.checkInService
      .createEntry(userId, CheckInType.CHECK_IN, new Date(), null)
      .subscribe({
        next: () => {
          this.snackBarService.showSuccess(
            this.translateService.instant("CHECK_INS.CHECK_IN_SUCCESS")
          );
          this.isSubmitting = false;
          this.loadEntries();
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
    const userId = this.loggedInUserId;
    if (!userId) {
      this.snackBarService.showError(
        this.translateService.instant("CHECK_INS.NOT_LOGGED_IN")
      );
      return;
    }

    this.isSubmitting = true;
    this.checkInService
      .createEntry(userId, CheckInType.CHECK_OUT, new Date(), null)
      .subscribe({
        next: () => {
          this.snackBarService.showSuccess(
            this.translateService.instant("CHECK_INS.CHECK_OUT_SUCCESS")
          );
          this.isSubmitting = false;
          this.loadEntries();
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
