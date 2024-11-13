import { Component } from '@angular/core';
import { ScheduleService } from '../../../../core/services/scheduleService';
import { ScheduleView } from '../../../../core/types/scheduleView';
import { CalendarClass } from '../../../../core/types/calendarClass';
import { SnackBarService } from '../../../../core/services/snackBarService';
import { map } from 'rxjs';
import { ClassTypes } from '../../../../core/types/enums/classTypes';

@Component({
  selector: 'app-mobile-home',
  templateUrl: './mobile-home.component.html',
  styleUrls: ['./mobile-home.component.scss']
})
export class MobileHomeComponent {
  ClassTypes = ClassTypes
  readonly HOURS_IN_WORKDAY = [7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20]
  displayTimes: string[] = []

  classSchedule: Map<number, CalendarClass> = new Map()

  constructor(private scheduleService: ScheduleService, private snackBarService: SnackBarService) {}

  ngOnInit(): void {
    this.scheduleService.getAllClasses(ScheduleView.DAY, new Date()).pipe(
      map(response => new Map(Object.entries(response))))
      .subscribe({
        next: (calendarClasses: Map<string, CalendarClass[]>) => {
          for (const values of calendarClasses.values()) {
            values.forEach((value) => {
              this.classSchedule.set(new Date(value.date).getHours(), value)
              console.log(this.classSchedule)
            }) 
          }
          this._generateDisplayTimes()
        }, 
        error: ({error}) => {
          this.snackBarService.showError(error.message)
        }
    })
  }

  private _generateDisplayTimes(): void {
    this.HOURS_IN_WORKDAY.forEach((hour) => {
      const ampm = hour >= 12 ? 'p.m.' : 'a.m.';
      const displayHour = hour % 12 || 12;
      this.displayTimes.push(`${displayHour}:00 ${ampm}`);
    })
  }
}