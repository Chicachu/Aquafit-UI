import { Component, Input } from "@angular/core";
import { TextInputType } from "../../../../core/types/enums/textInputType";
import { BaseFormControlComponent } from "../base-form-control/base-form-control.component";
import { FormGroupDirective, Validators } from "@angular/forms";
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
    } else if (this.type === TextInputType.PHONE) {
      this.control.addValidators(Validators.pattern('^[+]?[0-9 ]*$'))
    }

    if (this.type !== TextInputType.PASSWORD) this.hidePassword = false
  }

  onInputChange(event: Event): void {
    switch(this.type) {
      case TextInputType.PHONE: 
        this.formatPhoneNumber(event)
        break
    }
  }

  formatPhoneNumber(event: Event) {
    const input = event.target as HTMLInputElement;
    let value = input.value.replace(/\D/g, ''); 
    
    if (value.length > 1) {
      if (value.length === 10) {
        value = value.replace(/(\d{3})(\d{3})(\d{4})/, '$1 $2 $3');
      } else if (value.length === 11) {
        value = value.replace(/(\d{1})(\d{3})(\d{3})(\d{4})/, '$1 $2 $3 $4');
      } else if (value.length === 12) {
        value = value.replace(/(\d{2})(\d{3})(\d{3})(\d{4})/, '$1 $2 $3 $4');
      } else if (value.length === 13) {
        value = value.replace(/(\d{3})(\d{3})(\d{3})(\d{4})/, '$1 $2 $3 $4');
      } else if (value.length === 7) { 
        value = value.replace(/(\d{3})(\d{4})/, '$1 $2');
      } 
    }
    
    this.formGroup.form.patchValue({
      phoneNumber: value
    }, { emitEvent: false });
  }
}