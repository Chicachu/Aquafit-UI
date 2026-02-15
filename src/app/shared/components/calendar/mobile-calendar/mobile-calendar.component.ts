import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges, TemplateRef } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { CalendarHourSlotItem } from '../calendar-hour-slot/calendar-hour-slot.component';

export interface LegendItem {
  label: string;
  color: string;
}

@Component({
  selector: 'app-mobile-calendar',
  templateUrl: './mobile-calendar.component.html',
  styleUrls: ['./mobile-calendar.component.scss']
})
export class MobileCalendarComponent implements OnChanges, OnInit {
  @Input() hours: string[] = []
  @Input() schedule: Map<string, CalendarHourSlotItem[]> = new Map()
  @Input() legendItems: LegendItem[] = []
  @Input() showLegend: boolean = false
  @Input() itemTemplate: TemplateRef<any> | null = null
  @Input() emptyTemplate: TemplateRef<any> | null = null
  @Input() initialDate?: Date
  @Output() dateChange = new EventEmitter<Date>()
  
  currentDate: Date = new Date()

  constructor(
    private translateService: TranslateService
  ) {}

  ngOnInit(): void {
    if (this.initialDate) {
      this.currentDate = new Date(this.initialDate)
    }
    // Emit initial date so parent can sync
    this.dateChange.emit(this.currentDate)
  }

  ngOnChanges(changes: SimpleChanges): void {
    // Handle input changes if needed
  }

  previousDay(): void {
    const newDate = new Date(this.currentDate)
    newDate.setDate(newDate.getDate() - 1)
    this.currentDate = newDate
    this.dateChange.emit(this.currentDate)
  }

  nextDay(): void {
    const newDate = new Date(this.currentDate)
    newDate.setDate(newDate.getDate() + 1)
    this.currentDate = newDate
    this.dateChange.emit(this.currentDate)
  }

  getFormattedDate(): string {
    const day = this.currentDate.getDate()
    const month = this.currentDate.getMonth() + 1
    const currentLang = this.translateService.currentLang || 'en'
    const locale = currentLang === 'es' ? 'es' : 'en-US'
    const shortDay = this.currentDate.toLocaleDateString(locale, { weekday: 'short' }).replace(/\.$/, '')
    const dayName = shortDay.charAt(0).toUpperCase() + shortDay.slice(1)

    if (currentLang === 'es') {
      return `${day}/${month} - ${dayName}`
    }
    return `${month}/${day} - ${dayName}`
  }

  getCurrentDate(): Date {
    return this.currentDate
  }
}
