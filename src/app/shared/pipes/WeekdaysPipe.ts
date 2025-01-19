import { Pipe, PipeTransform } from "@angular/core";
import { TranslateService } from "@ngx-translate/core";
import { Weekday } from "../../core/types/enums/weekday";

@Pipe({
  name: 'weekdays',
  pure: false
})
export class WeekdaysPipe implements PipeTransform {
  constructor(private translate: TranslateService) { }

  transform(days: number[], separator: string = ', ', shorthand: boolean = true): string {
    if (!days || days.length === 0) return '';
    const identifier = shorthand ? 'WEEKDAYS_SHORT' : 'WEEKDAYS'
    return days
      .map(day => this.translate.instant(`${identifier}.${Weekday[day]}`))
      .join(separator);
  }
}
