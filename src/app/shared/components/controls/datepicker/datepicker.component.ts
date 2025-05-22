import { Component, forwardRef } from "@angular/core";
import { BaseFormControlComponent } from "../base-form-control/base-form-control.component";
import { NG_VALUE_ACCESSOR } from "@angular/forms";

@Component({
  selector: 'app-datepicker',
  templateUrl: './datepicker.component.html',
  styleUrls: ['../base-form-control/base-form-control.component.scss']
})
export class DatepickerComponent extends BaseFormControlComponent {
  
}