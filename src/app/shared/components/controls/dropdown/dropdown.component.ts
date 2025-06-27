import { Component, forwardRef, Input } from "@angular/core";
import { BaseFormControlComponent } from "../base-form-control/base-form-control.component";
import { SelectOption } from "../../../../core/types/selectOption";
import { FormatOptions } from "../../../../core/types/enums/formatOptions";
import { NG_VALUE_ACCESSOR } from "@angular/forms";

@Component({
  selector: 'app-dropdown',
  templateUrl: './dropdown.component.html',
  styleUrls: ['../base-form-control/base-form-control.component.scss']
})
export class DropdownComponent extends BaseFormControlComponent {
  readonly FormatOptions = FormatOptions
  @Input() options!: SelectOption[]
  @Input() i18nPrefix: string | null = null
  @Input() formatOption: FormatOptions | null = null
  @Input() hasNoSelectOption = false 
}