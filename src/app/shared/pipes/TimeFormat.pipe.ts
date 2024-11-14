import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
 name: 'timeFormat'
})
export class TimeFormatPipe implements PipeTransform {
 transform(value: string | number): string {
   if (!value) return '';

   let hours: number;
   let minutes: number = 0;

   if (typeof value === 'number') {
     hours = value;
   } else {
     const [hoursStr, minutesStr] = value.split(':');
     hours = parseInt(hoursStr);
     minutes = minutesStr ? parseInt(minutesStr) : 0;
   }

   const period = hours >= 12 ? 'p.m.' : 'a.m.';
   hours = hours % 12 || 12; 

   const minutesFormatted = minutes > 0 ? `:${minutes.toString().padStart(2, '0')}` : ':00';
   
   return `${hours}${minutesFormatted}${period}`;
 }
}
