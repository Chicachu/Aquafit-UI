import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { AdminNavService } from '@areas/admin/config/admin-nav.service';
import { map } from 'rxjs';
import { ScheduleService } from '@core/services/scheduleService';
import { ScheduleView } from '@core/types/scheduleView';
import { CalendarClass } from '@core/types/calendarClass';
import { SnackBarService } from '@core/services/snackBarService';
import { ClassService } from '@core/services/classService';
import { CalendarHourSlotItem } from '@shared/components/calendar/calendar-hour-slot/calendar-hour-slot.component';
import { LegendItem } from '@shared/components/calendar/mobile-calendar/mobile-calendar.component';

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

  private readonly locationColorPalette = [
    '#4CAF50', '#E91E63', '#2196F3', '#FF9800', '#9C27B0', '#00BCD4', '#FF5722', '#795548'
  ];
  private readonly lightColors = ['#FF9800', '#00BCD4', '#4CAF50'];

  constructor(
    private scheduleService: ScheduleService,
    private snackBarService: SnackBarService,
    private classService: ClassService,
    private adminNavService: AdminNavService
  ) {}

  ngOnInit(): void {
    this._loadLocations();
    this._loadSchedule();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['location']) {
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

          scheduleByDay.set(dateKey, hourMap);
        });

        return scheduleByDay;
      })
    ).subscribe({
      next: scheduleByDay => {
        this.scheduleByDay = scheduleByDay;
        this.isLoading = false;
      },
      error: ({ error }) => {
        this.isLoading = false;
        this.snackBarService.showError(error.message);
      }
    });
  }
}
