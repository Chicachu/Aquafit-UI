import { Component, Input, TemplateRef } from '@angular/core';

export interface CalendarHourSlotItem {
  [key: string]: any;
}

@Component({
  selector: 'app-calendar-hour-slot',
  templateUrl: './calendar-hour-slot.component.html',
  styleUrls: ['./calendar-hour-slot.component.scss']
})
export class CalendarHourSlotComponent {
  @Input() hour: string = ''
  @Input() items: CalendarHourSlotItem[] = []
  @Input() itemTemplate: TemplateRef<any> | null = null
  @Input() emptyTemplate: TemplateRef<any> | null = null
}
