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
  readonly HOURS_IN_WORKDAY = [7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20]

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
        }, 
        error: ({error}) => {
          this.snackBarService.showError(error.message)
        }
    })
  }
}