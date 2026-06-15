import {
  Component,
  HostBinding,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  SimpleChanges,
} from '@angular/core';
import { Subscription } from 'rxjs';
import { ButtonType } from '../breadcrumb-nav-bar/breadcrumb-nav-bar.component';
import { CheckInRefreshService } from '@core/services/checkInRefreshService';
import { CheckInService, CheckInType, EmployeeCheckIn } from '@core/services/checkInService';
import { SnackBarService } from '@core/services/snackBarService';
import { TranslateService } from '@ngx-translate/core';
import { UserService } from '@core/services/userService';
import { User } from '@core/types/user';

export interface CheckInMonthGroup {
  year: number;
  month: number;
  labelDate: Date;
  entryCount: number;
}

@Component({
  selector: 'app-check-ins-history',
  templateUrl: './check-ins-history.component.html',
  styleUrls: ['./check-ins-history.component.scss'],
})
export class CheckInsHistoryComponent implements OnInit, OnChanges, OnDestroy {
  @Input() @HostBinding('class.panel-view') panelView = false;
  @Input() userId: string | null = null;
  @Input() year: number | null = null;
  @Input() month: number | null = null;

  readonly ButtonType = ButtonType;
  readonly CheckInType = CheckInType;

  employee: User | null = null;
  entries: EmployeeCheckIn[] = [];
  monthGroups: CheckInMonthGroup[] = [];
  isLoadingEntries = false;

  private refreshSubscription?: Subscription;

  constructor(
    private checkInService: CheckInService,
    private checkInRefreshService: CheckInRefreshService,
    private snackBarService: SnackBarService,
    private translateService: TranslateService,
    private userService: UserService
  ) {}

  ngOnInit(): void {
    this.refreshSubscription = this.checkInRefreshService.refresh$.subscribe((employeeNumber) => {
      if (employeeNumber === this.staffEmployeeNumber) {
        this.loadEntries();
      }
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['userId']) {
      this._loadEmployee();
    }
  }

  ngOnDestroy(): void {
    this.refreshSubscription?.unsubscribe();
  }

  get showMonthDetail(): boolean {
    return this.year != null && this.month != null;
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
    return !!this.employee && !this.staffEmployeeNumber;
  }

  get selectedMonthDate(): Date | null {
    if (!this.showMonthDetail || this.year == null || this.month == null) {
      return null;
    }

    return new Date(this.year, this.month - 1, 1);
  }

  get monthEntries(): EmployeeCheckIn[] {
    if (!this.showMonthDetail || this.year == null || this.month == null) {
      return [];
    }

    return this.entries
      .filter((entry) => {
        const date = new Date(entry.date);
        return date.getFullYear() === this.year && date.getMonth() + 1 === this.month;
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  get historyOverviewBackRoute(): string[] | null {
    if (!this.userId) {
      return null;
    }

    return ['/admin/check-ins', this.userId];
  }

  getMonthLink(group: CheckInMonthGroup): string[] {
    if (!this.userId) {
      return [];
    }

    return ['/admin/check-ins', this.userId, 'entries', String(group.year), String(group.month)];
  }

  loadEntries(): void {
    const emp = this.staffEmployeeNumber;
    if (!emp) {
      return;
    }

    this.isLoadingEntries = true;
    this.checkInService.getEntriesByEmployeeId(emp).subscribe({
      next: (entries) => {
        this.entries = entries;
        this.monthGroups = this._buildMonthGroups(entries);
        this.isLoadingEntries = false;
      },
      error: (err) => {
        this.snackBarService.showError(
          err?.error?.message ?? this.translateService.instant('CHECK_INS.LOAD_ENTRIES_ERROR')
        );
        this.isLoadingEntries = false;
      },
    });
  }

  private _loadEmployee(): void {
    if (!this.userId) {
      this.employee = null;
      this.entries = [];
      this.monthGroups = [];
      return;
    }

    this.userService.getUser(this.userId).subscribe({
      next: (user) => {
        this.employee = user;
        this.loadEntries();
      },
      error: (err) => {
        this.employee = null;
        this.entries = [];
        this.monthGroups = [];
        this.snackBarService.showError(err?.error?.message ?? '');
      },
    });
  }

  private _buildMonthGroups(entries: EmployeeCheckIn[]): CheckInMonthGroup[] {
    const counts = new Map<string, { year: number; month: number; entryCount: number }>();

    for (const entry of entries) {
      const date = new Date(entry.date);
      const year = date.getFullYear();
      const month = date.getMonth() + 1;
      const key = `${year}-${month}`;
      const existing = counts.get(key);

      if (existing) {
        existing.entryCount += 1;
      } else {
        counts.set(key, { year, month, entryCount: 1 });
      }
    }

    return Array.from(counts.values())
      .map(({ year, month, entryCount }) => ({
        year,
        month,
        labelDate: new Date(year, month - 1, 1),
        entryCount,
      }))
      .sort((a, b) => b.labelDate.getTime() - a.labelDate.getTime());
  }

  private _formatEmployeeNumber(employeeId: number | null | undefined): string | null {
    if (employeeId == null) {
      return null;
    }

    return String(employeeId).padStart(6, '0');
  }
}
