import { Component } from '@angular/core';
import { ScheduleService } from '../../../../core/services/scheduleService';
import { ScheduleView } from '../../../../core/types/scheduleView';
import { CalendarClass } from '../../../../core/types/calendarClass';
import { SnackBarService } from '../../../../core/services/snackBarService';
import { map } from 'rxjs';
import { ClassType } from '../../../../core/types/enums/classType';

@Component({
  selector: 'app-mobile-home',
  templateUrl: './mobile-home.component.html',
  styleUrls: ['./mobile-home.component.scss']
})
export class MobileHomeComponent {
  ClassTypes = ClassType
  readonly HOURS_IN_WORKDAY = ["7:00", "8:00", "9:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00", "19:00", "20:00"]

  classSchedule: Map<string, CalendarClass> = new Map()

  constructor(private scheduleService: ScheduleService, private snackBarService: SnackBarService) {}

  ngOnInit(): void {
    this.scheduleService.getAllClasses(ScheduleView.DAY, new Date()).pipe(
      map(response => new Map(Object.entries(response))))
      .subscribe({
        next: (calendarClasses: Map<string, CalendarClass[]>) => {
          for (const values of calendarClasses.values()) {
            values.forEach((value) => {
              const hour = new Date(value.date).getHours();
              const timeKey = `${hour.toString().padStart(2, '0')}:00`;
              this.classSchedule.set(timeKey, value);
            }) 
          }
        }, 
        error: ({error}) => {
          this.snackBarService.showError(error.message)
        }
    })
  }
}