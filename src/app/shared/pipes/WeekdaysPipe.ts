import { Pipe, PipeTransform } from "@angular/core";
import { TranslateService } from "@ngx-translate/core";
import { Weekday } from "../../core/types/enums/weekday";

@Pipe({
  name: 'weekdays',
  pure: false
})
export class WeekdaysPipe implements PipeTransform {
  constructor(private translate: TranslateService) { }

  transform(days: string | number | number[], separator: string = ', ', shorthand: boolean = true): string {
    if (!days) return ''
    const daysArray = Array.isArray(days) ? days : [days]
    const useLetterAbbrev = separator === 'letter' || separator === 'single'
    const joinSeparator = useLetterAbbrev ? ' ' : separator
    const identifier = useLetterAbbrev ? 'WEEKDAYS_LETTER' : (shorthand ? 'WEEKDAYS_SHORT' : 'WEEKDAYS')
    return daysArray
      .map(day => {
        const dayNum = typeof day === 'string' ? Number(day) : day
        return this.translate.instant(`${identifier}.${Weekday[dayNum]}`)
      })
      .join(joinSeparator)
  }
}
