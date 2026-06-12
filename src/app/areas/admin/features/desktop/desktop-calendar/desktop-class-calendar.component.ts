import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { AdminNavService } from '@areas/admin/config/admin-nav.service';
import { forkJoin, map } from 'rxjs';
import { ScheduleService } from '@core/services/scheduleService';
import { ScheduleView } from '@core/types/scheduleView';
import { CalendarClass } from '@core/types/calendarClass';
import { SnackBarService } from '@core/services/snackBarService';
import { ClassService } from '@core/services/classService';
import { CalendarHourSlotItem } from '@shared/components/calendar/calendar-hour-slot/calendar-hour-slot.component';
import { LegendItem } from '@shared/components/calendar/mobile-calendar/mobile-calendar.component';
import { UserService } from '@core/services/userService';
import { PaymentStatus } from '@core/types/enums/paymentStatus';
import { ClassDetails } from '@core/types/classes/classDetails';

interface ClassPaymentStatusCounts {
  almostDueCount: number;
  overdueCount: number;
}

interface ClassItemWithStyles extends CalendarHourSlotItem {
  backgroundColor?: string;
  textColor?: string;
}

@Component({
  selector: 'app-desktop-class-calendar',
  templateUrl: './desktop-class-calendar.component.html',
  styleUrl: './desktop-class-calendar.component.scss'
})
export class DesktopClassCalendarComponent implements OnChanges, OnInit {
  @Input() location = '';
  @Input() classType = '';

  private readonly maxClassesPerTimeSlot = 2;

  readonly HOURS_IN_WORKDAY = [
    '7:00', '8:00', '9:00', '10:00', '11:00', '12:00', '13:00',
    '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00'
  ];

  scheduleByDay: Map<string, Map<string, ClassItemWithStyles[]>> = new Map();
  locations: string[] = [];
  locationColors: Map<string, string> = new Map();
  locationTextColors: Map<string, string> = new Map();
  legendItems: LegendItem[] = [];
  currentDate = new Date();
  isLoading = false;
  paymentStatusByClassId = new Map<string, ClassPaymentStatusCounts>();

  private readonly locationColorPalette = [
    '#4CAF50', '#F27AB8', '#2196F3', '#FF9800', '#9C27B0', '#00BCD4', '#FF5722', '#795548'
  ];
  private readonly lightColors = ['#FF9800', '#00BCD4', '#4CAF50', '#F27AB8'];

  constructor(
    private scheduleService: ScheduleService,
    private snackBarService: SnackBarService,
    private classService: ClassService,
    private adminNavService: AdminNavService,
    private userService: UserService
  ) {}

  get canViewPayments(): boolean {
    return this.userService.isAdmin || this.userService.isManager || this.userService.isReceptionist;
  }

  hasAlmostDuePayments(classId: string | undefined): boolean {
    if (!classId) {
      return false;
    }

    return (this.paymentStatusByClassId.get(classId)?.almostDueCount ?? 0) > 0;
  }

  hasOverduePayments(classId: string | undefined): boolean {
    if (!classId) {
      return false;
    }

    return (this.paymentStatusByClassId.get(classId)?.overdueCount ?? 0) > 0;
  }

  ngOnInit(): void {
    this._loadLocations();
    this._loadSchedule();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['location'] || changes['classType']) {
      this.scheduleByDay = new Map();
      this._updateLegendItems();
      this._loadSchedule();
    }
  }

  goToClassDetails(classId: string | undefined): void {
    if (classId) {
      this.adminNavService.navigateToFeature('classes', classId, 'details');
    }
  }

  onDateChange(date: Date): void {
    this.currentDate = date;
    this._loadSchedule();
  }

  private _loadLocations(): void {
    this.classService.getAllLocations().subscribe({
      next: (locations: string[]) => {
        this.locations = locations;
        locations.forEach((loc, index) => {
          const color = this.locationColorPalette[index % this.locationColorPalette.length];
          this.locationColors.set(loc, color);
          this.locationTextColors.set(
            loc,
            this.lightColors.includes(color) ? '#000000' : '#FFFFFF'
          );
        });
        this._updateLegendItems();
      },
      error: ({ error }) => {
        this.snackBarService.showError(error.message);
      }
    });
  }

  private _updateLegendItems(): void {
    if (this.location === '' && this.locations.length > 0) {
      this.legendItems = this.locations.map(loc => ({
        label: loc,
        color: this.getLocationColor(loc)
      }));
    } else {
      this.legendItems = [];
    }
  }

  private getLocationColor(location: string): string {
    return this.locationColors.get(location) || '#757575';
  }

  private getLocationTextColor(location: string): string {
    return this.locationTextColors.get(location) || '#FFFFFF';
  }

  private _loadSchedule(): void {
    this.isLoading = true;
    this.scheduleService.getAllClasses(ScheduleView.WEEK, this.currentDate, this.location).pipe(
      map(response => {
        const scheduleByDay = new Map<string, Map<string, ClassItemWithStyles[]>>();
        const responseMap = new Map(Object.entries(response));

        responseMap.forEach((classes: CalendarClass[], dateKey) => {
          const hourMap = new Map<string, ClassItemWithStyles[]>();

          classes.forEach((classItem: CalendarClass) => {
            if (!this._matchesClassType(classItem)) {
              return;
            }

            const hour = new Date(classItem.date).getHours();
            const timeKey = `${hour}:00`;
            const loc = classItem.classLocation || '';

            if (!hourMap.has(timeKey)) {
              hourMap.set(timeKey, []);
            }

            hourMap.get(timeKey)!.push({
              ...classItem,
              backgroundColor: this.getLocationColor(loc),
              textColor: this.getLocationTextColor(loc)
            });
          });

          if (this.location === '') {
            this._limitClassesPerTimeSlot(hourMap);
          }

          scheduleByDay.set(dateKey, hourMap);
        });

        return scheduleByDay;
      })
    ).subscribe({
      next: scheduleByDay => {
        this.scheduleByDay = scheduleByDay;
        this.isLoading = false;
        this._loadPaymentStatusForClasses(this._collectUniqueClassIds(scheduleByDay));
      },
      error: ({ error }) => {
        this.isLoading = false;
        this.snackBarService.showError(error.message);
      }
    });
  }

  private _collectUniqueClassIds(scheduleByDay: Map<string, Map<string, ClassItemWithStyles[]>>): string[] {
    const classIds = new Set<string>();

    scheduleByDay.forEach(hourMap => {
      hourMap.forEach(items => {
        items.forEach(item => {
          const classId = item['_id'] as string | undefined;
          if (classId) {
            classIds.add(classId);
          }
        });
      });
    });

    return Array.from(classIds);
  }

  private _loadPaymentStatusForClasses(classIds: string[]): void {
    this.paymentStatusByClassId.clear();

    if (!this.canViewPayments || classIds.length === 0) {
      return;
    }

    forkJoin(classIds.map(classId => this.classService.getClassDetails(classId))).subscribe({
      next: (classDetailsList: ClassDetails[]) => {
        const paymentStatusByClassId = new Map<string, ClassPaymentStatusCounts>();

        classDetailsList.forEach(details => {
          if (!details._id) {
            return;
          }

          const counts = this._countPaymentStatuses(details);
          if (counts.almostDueCount > 0 || counts.overdueCount > 0) {
            paymentStatusByClassId.set(details._id, counts);
          }
        });

        this.paymentStatusByClassId = paymentStatusByClassId;
      },
      error: ({ error }) => {
        this.snackBarService.showError(error?.message ?? '');
      }
    });
  }

  private _countPaymentStatuses(classDetails: ClassDetails): ClassPaymentStatusCounts {
    let almostDueCount = 0;
    let overdueCount = 0;

    for (const client of classDetails.clients ?? []) {
      const status = this._resolvePaymentStatus(client.currentPayment?.paymentStatus);
      if (status === PaymentStatus.ALMOST_DUE) {
        almostDueCount++;
      } else if (status === PaymentStatus.OVERDUE) {
        overdueCount++;
      }
    }

    return { almostDueCount, overdueCount };
  }

  private _resolvePaymentStatus(status: string | undefined): PaymentStatus | null {
    if (!status) {
      return null;
    }

    if (Object.values(PaymentStatus).includes(status as PaymentStatus)) {
      return status as PaymentStatus;
    }

    const normalized = Object.values(PaymentStatus).find(
      paymentStatus => paymentStatus === status || paymentStatus === status.replace(/_/g, ' ')
    );

    return normalized ?? null;
  }

  private _matchesClassType(classItem: CalendarClass): boolean {
    if (!this.classType) {
      return true;
    }

    return classItem.classType === this.classType;
  }

  private _limitClassesPerTimeSlot(hourMap: Map<string, ClassItemWithStyles[]>): void {
    hourMap.forEach((items, timeKey) => {
      if (items.length > this.maxClassesPerTimeSlot) {
        hourMap.set(timeKey, items.slice(0, this.maxClassesPerTimeSlot));
      }
    });
  }
}
