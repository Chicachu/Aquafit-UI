import { Component, Input } from "@angular/core";
import { BaseFormControlComponent } from "../base-form-control/base-form-control.component";
import { FormGroupDirective } from "@angular/forms";
import { ErrorsService } from "../../../../core/services/errorsService";
import { SelectOption } from "../../../../core/types/selectOption";

@Component({
  selector: 'app-multi-select-chips',
  templateUrl: './multi-select-chips.component.html',
  styleUrls: ['./multi-select-chips.component.scss']
})
export class MultiSelectChipsComponent extends BaseFormControlComponent {
  @Input() options!: SelectOption[]
  @Input() i18nPrefix!: string

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