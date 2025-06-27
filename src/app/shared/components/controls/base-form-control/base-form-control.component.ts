import { Component, Input, OnInit } from "@angular/core";
import { ErrorMessageProvider, ErrorsService } from "../../../../core/services/errorsService";
import { FormControl, FormGroupDirective, Validators } from "@angular/forms";

@Component({
  template: ''
})
export abstract class BaseFormControlComponent implements OnInit, ErrorMessageProvider {
  @Input() label?: string
  @Input() placeholder?: string
  @Input() hint?: string
  @Input() controlName: string = ''
  @Input() autocomplete?: string

  @Input() maxLength?: number
  @Input() minLength?: number
  @Input() min?: number
  @Input() pattern?: string
  @Input() required = false
  @Input() customErrorMessages?: { [key: string]: string }
  @Input()
  set disabled(value: boolean) {
    this._disabled = value
    this.setDisabledState(value)
  }
  
  get disabled(): boolean {
    return this._disabled
  }
  private _disabled = false
  control!: FormControl

  constructor(protected formGroup: FormGroupDirective, private errorService: ErrorsService) {
  }

  ngOnInit(): void {
    if (!this.controlName) {
      throw new Error(`[${this.constructor.name}] Missing controlName`);
    }
  
    if (!this.formGroup || !this.formGroup.form) {
      throw new Error(`[${this.constructor.name}] formGroup is missing`);
    }
    if (this.controlName) {
      this.control = this.formGroup.form.get(this.controlName) as FormControl
      if (this.disabled) {
        this.control.disable()
      }

      if (!this.control) {
        throw new Error(`[${this.constructor.name}] FormControl "${this.controlName}" not found in formGroup`);
      }
      
      if (this.required && !this.control.hasValidator(Validators.required)) {
        this.control.addValidators(Validators.required)
      }
      
      if (this.maxLength) {
        this.control.addValidators(Validators.maxLength(this.maxLength))
      }
      
      if (this.minLength) {
        this.control.addValidators(Validators.minLength(this.minLength))
      }
      
      if (this.min !== undefined) {
        this.control.addValidators(Validators.min(this.min))
      }

      if (this.pattern) {
        this.control.addValidators(Validators.pattern(this.pattern))
      }
    }
  }

  markAsTouched(): void {
    this.control.markAsTouched()
  }

  writeValue(value: any): void {
    if (this.control) {
      this.control.setValue(value, { emitEvent: false })
    }
  }

  setDisabledState(isDisabled: boolean): void {
    if (this.control) {
      isDisabled ? this.control.disable() : this.control.enable();
    }
  }

  getErrorMessage(): string {
    if (!this.control?.errors) return ''

    if (this.customErrorMessages) {
      const errorKey = Object.keys(this.control.errors)[0]
      if (this.customErrorMessages[errorKey]) {
        return this.customErrorMessages[errorKey]
      }
    }

    return this.errorService.getErrorMessage(this.controlName, this.control)
  }
}