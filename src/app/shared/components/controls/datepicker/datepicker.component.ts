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

  get minDateValue(): Date | null {
    return this.minDate ?? null
  }

  get maxDateValue(): Date | null {
    return this.maxDate ?? null
  }

  get dateFilter(): DateFilterFn<Date | null> {
    return (date: Date | null): boolean => {
      if (!date) {
        return false
      }

      if (this.minDate) {
        const min = new Date(this.minDate)
        min.setHours(0, 0, 0, 0)
        const checkDate = new Date(date)
        checkDate.setHours(0, 0, 0, 0)
        if (checkDate < min) {
          return false
        }
      }

      if (this.maxDate) {
        const max = new Date(this.maxDate)
        max.setHours(0, 0, 0, 0)
        const checkDate = new Date(date)
        checkDate.setHours(0, 0, 0, 0)
        if (checkDate > max) {
          return false
        }
      }

      return true
    }
  }
}