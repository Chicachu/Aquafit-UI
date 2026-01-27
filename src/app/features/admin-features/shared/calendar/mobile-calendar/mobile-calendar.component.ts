import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { ScheduleService } from '@/core/services/scheduleService';
import { ScheduleView } from '@/core/types/scheduleView';
import { CalendarClass } from '@/core/types/calendarClass';
import { SnackBarService } from '@/core/services/snackBarService';
import { ClassType } from '@/core/types/enums/classType';
import { ClassService } from '@/core/services/classService';
import { map } from 'rxjs';

@Component({
  selector: 'app-mobile-calendar',
  templateUrl: './mobile-calendar.component.html',
  styleUrls: ['./mobile-calendar.component.scss']
})
export class MobileCalendarComponent implements OnChanges, OnInit {
  @Input() location: string = ''
  ClassTypes = ClassType
  readonly HOURS_IN_WORKDAY = ["7:00", "8:00", "9:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00", "19:00", "20:00"]

  classSchedule: Map<string, CalendarClass[]> = new Map()
  locations: string[] = []
  locationColors: Map<string, string> = new Map()
  private readonly locationColorPalette = ['#4CAF50', '#E91E63', '#2196F3', '#FF9800', '#9C27B0', '#00BCD4', '#FF5722', '#795548']

  constructor(
    private scheduleService: ScheduleService, 
    private snackBarService: SnackBarService,
    private classService: ClassService
  ) {}

  ngOnInit(): void {
    this._loadLocations()
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['location']) {
      this.classSchedule = new Map()
      this._loadSchedule()
    }
  }

  private _loadLocations(): void {
    this.classService.getAllLocations().subscribe({
      next: (locations: string[]) => {
        this.locations = locations
        locations.forEach((location, index) => {
          const colorIndex = index % this.locationColorPalette.length
          this.locationColors.set(location, this.locationColorPalette[colorIndex])
        })
      },
      error: ({error}) => {
        this.snackBarService.showError(error.message)
      }
    })
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
    this.scheduleService.getAllClasses(ScheduleView.DAY, new Date(), this.location).pipe(
      map(response => new Map(Object.entries(response))))
      .subscribe({
        next: (calendarClasses: Map<string, CalendarClass[]>) => {
          for (const values of calendarClasses.values()) {
            values.forEach((value) => {
              const hour = new Date(value.date).getHours()
              const timeKey = `${hour.toString()}:00`
              if (!this.classSchedule.has(timeKey)) {
                this.classSchedule.set(timeKey, [])
              }
              this.classSchedule.get(timeKey)!.push(value)
            }) 
          }
        }, 
        error: ({error}) => {
          this.snackBarService.showError(error.message)
        }
    })
  }
}