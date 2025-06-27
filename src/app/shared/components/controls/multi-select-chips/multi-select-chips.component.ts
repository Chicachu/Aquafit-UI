import { Component, forwardRef, Input } from "@angular/core";
import { BaseFormControlComponent } from "../base-form-control/base-form-control.component";
import { FormGroupDirective, NG_VALUE_ACCESSOR } from "@angular/forms";
import { ErrorsService } from "../../../../core/services/errorsService";
import { SelectOption } from "../../../../core/types/selectOption";

@Component({
  selector: 'app-multi-select-chips',
  templateUrl: './multi-select-chips.component.html',
  styleUrls: ['./multi-select-chips.component.scss', '../base-form-control/base-form-control.component.scss']
})
export class MultiSelectChipsComponent extends BaseFormControlComponent {
  @Input() options!: SelectOption[]
  @Input() i18nPrefix!: string
  @Input() disabledChipsIndices: number[] | undefined 

  constructor(formGroup: FormGroupDirective, errorService: ErrorsService) {
    super(formGroup, errorService)
  }

  get selectedOptions(): Set<string | number> {
    return new Set(this.control?.value || []);
  }

  toggleOption(value: string | number): void {
    const currentOptions = this.control?.value || []
    const optionIndex = currentOptions.indexOf(value)
    
    if (optionIndex === -1) {
      currentOptions.push(value)
    } else {
      currentOptions.splice(optionIndex, 1)
    }

    this.control?.setValue(currentOptions)
  }
}