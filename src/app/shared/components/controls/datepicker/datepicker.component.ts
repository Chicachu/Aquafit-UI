import { Component, forwardRef, Input } from "@angular/core";
import { BaseFormControlComponent } from "../base-form-control/base-form-control.component";
import { NG_VALUE_ACCESSOR } from "@angular/forms";
import { DateFilterFn } from "@angular/material/datepicker";

@Component({
  selector: 'app-datepicker',
  templateUrl: './datepicker.component.html',
  styleUrls: ['../base-form-control/base-form-control.component.scss']
})
export class DatepickerComponent extends BaseFormControlComponent {
  @Input() minDate?: Date | null
  @Input() maxDate?: Date | null
  @Input() allowedWeekdays?: number[] | null
  @Input() disabledDates?: Date[] | null

  get minDateValue(): Date | null {
    return this.minDate ?? null
  }

  get maxDateValue(): Date | null {
    return this.maxDate ?? null
  }

  // Use arrow function property to maintain stable reference and access to 'this'
  dateFilter = (date: Date | null): boolean => {
    if (!date) {
      return false
    }

    // Ensure date is a Date object
    const dateObj = date instanceof Date ? date : new Date(date)
    if (isNaN(dateObj.getTime())) {
      return false
    }

    if (this.minDate) {
      const min = new Date(this.minDate)
      min.setHours(0, 0, 0, 0)
      const checkDate = new Date(dateObj)
      checkDate.setHours(0, 0, 0, 0)
      if (checkDate < min) {
        return false
      }
    }

    if (this.maxDate) {
      const max = new Date(this.maxDate)
      max.setHours(0, 0, 0, 0)
      const checkDate = new Date(dateObj)
      checkDate.setHours(0, 0, 0, 0)
      if (checkDate > max) {
        return false
      }
    }

    // Filter by allowed weekdays if provided
    if (this.allowedWeekdays && this.allowedWeekdays.length > 0) {
      const dayOfWeek = dateObj.getDay()
      if (!this.allowedWeekdays.includes(dayOfWeek)) {
        return false
      }
    }

    // Filter out disabled dates if provided
    if (this.disabledDates && this.disabledDates.length > 0) {
      const checkDate = new Date(dateObj)
      checkDate.setHours(0, 0, 0, 0)
      
      const isDisabled = this.disabledDates.some(disabledDate => {
        const disabledDateObj = new Date(disabledDate)
        disabledDateObj.setHours(0, 0, 0, 0)
        return disabledDateObj.getTime() === checkDate.getTime()
      })
      
      if (isDisabled) {
        return false
      }
    }

    return true
  }
}