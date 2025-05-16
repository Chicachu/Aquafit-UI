import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { ScheduleService } from '@/core/services/scheduleService';
import { ScheduleView } from '@/core/types/scheduleView';
import { CalendarClass } from '@/core/types/calendarClass';
import { SnackBarService } from '@/core/services/snackBarService';
import { ClassType } from '@/core/types/enums/classType';
import { map } from 'rxjs';

@Component({
  selector: 'app-mobile-calendar',
  templateUrl: './mobile-calendar.component.html',
  styleUrls: ['./mobile-calendar.component.scss']
})
export class MobileCalendarComponent implements OnChanges {
  @Input() location: string = ''
  ClassTypes = ClassType
  readonly HOURS_IN_WORKDAY = ["7:00", "8:00", "9:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00", "19:00", "20:00"]

  classSchedule: Map<string, CalendarClass> = new Map()

  constructor(private scheduleService: ScheduleService, private snackBarService: SnackBarService) {}

  ngOnInit(): void {
    this._loadSchedule()
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['location']) {
      this.classSchedule = new Map()
      this._loadSchedule()
    }
  }

  private _loadSchedule(): void {
    this.scheduleService.getAllClasses(ScheduleView.DAY, new Date(), this.location).pipe(
      map(response => new Map(Object.entries(response))))
      .subscribe({
        next: (calendarClasses: Map<string, CalendarClass[]>) => {
          for (const values of calendarClasses.values()) {
            values.forEach((value) => {
              const hour = new Date(value.date).getHours()
              const timeKey = `${hour.toString().padStart(2, '0')}:00`
              this.classSchedule.set(timeKey, value)
            }) 
          }
        }, 
        error: ({error}) => {
          this.snackBarService.showError(error.message)
        }
    })
  }
}