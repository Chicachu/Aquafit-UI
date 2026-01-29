import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { ScheduleService } from '@/core/services/scheduleService';
import { ScheduleView } from '@/core/types/scheduleView';
import { CalendarClass } from '@/core/types/calendarClass';
import { SnackBarService } from '@/core/services/snackBarService';
import { ClassService } from '@/core/services/classService';
import { CalendarHourSlotItem } from '@/shared/components/calendar/calendar-hour-slot/calendar-hour-slot.component';
import { LegendItem } from '@/shared/components/calendar/mobile-calendar/mobile-calendar.component';
import { map } from 'rxjs';

@Component({
  selector: 'app-class-calendar',
  templateUrl: './class-calendar.component.html',
  styleUrls: ['./class-calendar.component.scss']
})
export class ClassCalendarComponent implements OnChanges, OnInit {
  @Input() location: string = ''
  readonly HOURS_IN_WORKDAY = ["7:00", "8:00", "9:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00", "19:00", "20:00"]

  classSchedule: Map<string, CalendarHourSlotItem[]> = new Map()
  locations: string[] = []
  locationColors: Map<string, string> = new Map()
  legendItems: LegendItem[] = []
  currentDate: Date = new Date()
  private readonly locationColorPalette = ['#4CAF50', '#E91E63', '#2196F3', '#FF9800', '#9C27B0', '#00BCD4', '#FF5722', '#795548']

  constructor(
    private scheduleService: ScheduleService, 
    private snackBarService: SnackBarService,
    private classService: ClassService
  ) {}

  ngOnInit(): void {
    this._loadLocations()
    this._loadSchedule()
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['location']) {
      this.classSchedule = new Map()
      this._updateLegendItems()
      this._loadSchedule()
    }
  }

  onDateChange(date: Date): void {
    this.currentDate = date
    this._loadSchedule()
  }

  private _loadLocations(): void {
    this.classService.getAllLocations().subscribe({
      next: (locations: string[]) => {
        this.locations = locations
        locations.forEach((location, index) => {
          const colorIndex = index % this.locationColorPalette.length
          const color = this.locationColorPalette[colorIndex]
          this.locationColors.set(location, color)
        })
        this._updateLegendItems()
      },
      error: ({error}) => {
        this.snackBarService.showError(error.message)
      }
    })
  }

  private _updateLegendItems(): void {
    if (this.location === '' && this.locations.length > 0) {
      this.legendItems = this.locations.map(loc => ({
        label: loc,
        color: this.getLocationColor(loc)
      }))
    } else {
      this.legendItems = []
    }
  }

  getLocationColor(location: string): string {
    return this.locationColors.get(location) || '#757575'
  }

  getLocationTextColor(location: string): string {
    // Use white text for darker colors, dark text for lighter colors
    const color = this.getLocationColor(location)
    // Light colors that need dark text: orange (#FF9800), cyan (#00BCD4), green (#4CAF50)
    const lightColors = ['#FF9800', '#00BCD4', '#4CAF50']
    if (lightColors.includes(color)) {
      return '#000000'
    }
    return '#FFFFFF'
  }

  private _loadSchedule(): void {
    this.scheduleService.getAllClasses(ScheduleView.DAY, this.currentDate, this.location).pipe(
      map(response => new Map(Object.entries(response))))
      .subscribe({
        next: (calendarClasses: Map<string, CalendarClass[]>) => {
          this.classSchedule = new Map()
          for (const values of calendarClasses.values()) {
            values.forEach((value) => {
              const hour = new Date(value.date).getHours()
              const timeKey = `${hour.toString()}:00`
              if (!this.classSchedule.has(timeKey)) {
                this.classSchedule.set(timeKey, [])
              }
              this.classSchedule.get(timeKey)!.push(value as CalendarHourSlotItem)
            }) 
          }
        }, 
        error: ({error}) => {
          this.snackBarService.showError(error.message)
        }
    })
  }
}
