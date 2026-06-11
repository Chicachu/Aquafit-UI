import {
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  TemplateRef
} from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { CalendarHourSlotItem } from '../calendar-hour-slot/calendar-hour-slot.component';
import { LegendItem } from '../mobile-calendar/mobile-calendar.component';

@Component({
  selector: 'app-desktop-week-calendar',
  templateUrl: './desktop-week-calendar.component.html',
  styleUrl: './desktop-week-calendar.component.scss'
})
export class DesktopWeekCalendarComponent implements OnInit {
  @Input() hours: string[] = [];
  @Input() scheduleByDay: Map<string, Map<string, CalendarHourSlotItem[]>> = new Map();
  @Input() legendItems: LegendItem[] = [];
  @Input() showLegend = false;
  @Input() itemTemplate: TemplateRef<unknown> | null = null;
  @Input() emptyTemplate: TemplateRef<unknown> | null = null;
  @Input() initialDate?: Date;

  @Output() dateChange = new EventEmitter<Date>();

  currentDate = new Date();
  weekDays: Date[] = [];

  constructor(private translateService: TranslateService) {}

  ngOnInit(): void {
    if (this.initialDate) {
      this.currentDate = new Date(this.initialDate);
    }
    this._updateWeekDays();
    this.dateChange.emit(this.currentDate);
  }

  previousWeek(): void {
    const next = new Date(this.currentDate);
    next.setDate(next.getDate() - 7);
    this._setCurrentDate(next);
  }

  nextWeek(): void {
    const next = new Date(this.currentDate);
    next.setDate(next.getDate() + 7);
    this._setCurrentDate(next);
  }

  getWeekLabel(): string {
    if (this.weekDays.length === 0) {
      return '';
    }

    const start = this.weekDays[0];
    const end = this.weekDays[6];
    const currentLang = this.translateService.currentLang || 'en';
    const locale = currentLang === 'es' ? 'es' : 'en-US';

    const startLabel = start.toLocaleDateString(locale, { month: 'short', day: 'numeric' });
    const endLabel = end.toLocaleDateString(locale, {
      month: 'short',
      day: 'numeric',
      year: start.getFullYear() !== end.getFullYear() ? 'numeric' : undefined
    });

    if (start.getFullYear() !== end.getFullYear()) {
      return `${startLabel}, ${start.getFullYear()} – ${endLabel}, ${end.getFullYear()}`;
    }

    return `${startLabel} – ${endLabel}, ${end.getFullYear()}`;
  }

  getDayHeader(day: Date): string {
    const currentLang = this.translateService.currentLang || 'en';
    const locale = currentLang === 'es' ? 'es' : 'en-US';
    const shortDay = day.toLocaleDateString(locale, { weekday: 'short' }).replace(/\.$/, '');
    const dayName = shortDay.charAt(0).toUpperCase() + shortDay.slice(1);

    if (currentLang === 'es') {
      return `${day.getDate()}/${day.getMonth() + 1}\n${dayName}`;
    }

    return `${day.getMonth() + 1}/${day.getDate()}\n${dayName}`;
  }

  getItemsForDayHour(day: Date, hour: string): CalendarHourSlotItem[] {
    return this.scheduleByDay.get(this._toDateKey(day))?.get(hour) ?? [];
  }

  isToday(day: Date): boolean {
    const today = new Date();
    return day.getDate() === today.getDate()
      && day.getMonth() === today.getMonth()
      && day.getFullYear() === today.getFullYear();
  }

  private _setCurrentDate(date: Date): void {
    this.currentDate = date;
    this._updateWeekDays();
    this.dateChange.emit(this.currentDate);
  }

  private _updateWeekDays(): void {
    const start = new Date(this.currentDate);
    start.setDate(this.currentDate.getDate() - this.currentDate.getDay());
    start.setHours(0, 0, 0, 0);

    this.weekDays = Array.from({ length: 7 }, (_, index) => {
      const day = new Date(start);
      day.setDate(start.getDate() + index);
      return day;
    });
  }

  private _toDateKey(date: Date): string {
    return date.toISOString().split('T')[0];
  }
}
