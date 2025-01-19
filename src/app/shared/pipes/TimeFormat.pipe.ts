import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'timeFormat'
})
export class TimeFormatPipe implements PipeTransform {
  transform(value: string): string {
    if (!value) return '';

    const [hoursStr] = value.split(':');
    const hours = parseInt(hoursStr);

    const period = hours >= 12 ? 'p.m.' : 'a.m.';
    const displayHour = hours % 12 || 12;

    return `${displayHour}:00${period}`;
  }
}
