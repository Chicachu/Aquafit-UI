import { Component, forwardRef, Input } from "@angular/core";
import { TextInputType } from "../../../../core/types/enums/textInputType";
import { BaseFormControlComponent } from "../base-form-control/base-form-control.component";
import { FormGroupDirective, NG_VALUE_ACCESSOR, Validators } from "@angular/forms";
import { ErrorsService } from "../../../../core/services/errorsService";

@Component({
  selector: 'app-text-input',
  templateUrl: './text-input.component.html',
  styleUrls: ['../base-form-control/base-form-control.component.scss']
})
export class TextInputComponent extends BaseFormControlComponent {
  @Input() type!: TextInputType
  hidePassword = true

  constructor(formGroup: FormGroupDirective, errorService: ErrorsService) {
    super(formGroup, errorService)
  }

  override ngOnInit(): void {
    super.ngOnInit()
    if (this.type === TextInputType.EMAIL) {
      this.control.addValidators(Validators.email)
    }

    if (this.type !== TextInputType.PASSWORD) this.hidePassword = false
  }

  onInputChange(event: Event): void {
    // Base implementation - can be overridden by child components
  }
}