import { Component, Input, OnInit } from "@angular/core";
import { TextInputComponent } from "../text-input/text-input.component";
import { FormGroupDirective, FormControl } from "@angular/forms";
import { ErrorsService } from "../../../../core/services/errorsService";
import { Validators } from "@angular/forms";
import { SelectOption } from "../../../../core/types/selectOption";

@Component({
  selector: 'app-phone-input',
  templateUrl: './phone-input.component.html',
  styleUrls: ['./phone-input.component.scss']
})
export class PhoneInputComponent extends TextInputComponent implements OnInit {
  @Input() countryCode: boolean = false // Show country code dropdown
  @Input() countryCodeControlName?: string // Optional separate control for country code
  countryCodeOptions: SelectOption[] = [
    { value: '+1', viewValue: '+1 (US/CA)' },
    { value: '+52', viewValue: '+52 (MX)' },
    { value: '+34', viewValue: '+34 (ES)' },
    { value: '+44', viewValue: '+44 (UK)' },
    { value: '+33', viewValue: '+33 (FR)' },
    { value: '+49', viewValue: '+49 (DE)' },
    { value: '+39', viewValue: '+39 (IT)' },
    { value: '+7', viewValue: '+7 (RU)' },
    { value: '+81', viewValue: '+81 (JP)' },
    { value: '+86', viewValue: '+86 (CN)' },
    { value: '+91', viewValue: '+91 (IN)' },
    { value: '+55', viewValue: '+55 (BR)' },
    { value: '+61', viewValue: '+61 (AU)' },
    { value: '+27', viewValue: '+27 (ZA)' },
    { value: '+20', viewValue: '+20 (EG)' }
  ]
  defaultCountryCode = '+52'

  constructor(formGroup: FormGroupDirective, errorService: ErrorsService) {
    super(formGroup, errorService)
    // Set the type to 'tel' for phone input
    this.type = 'tel' as any
  }

  override ngOnInit(): void {
    // Add phone validator
    super.ngOnInit()
    this.control.addValidators(Validators.pattern('^[+]?[0-9 ]*$'))
    
    // Initialize country code if country code feature is enabled and control is provided
    if (this.countryCode && this.countryCodeControlName) {
      const countryCodeControl = this.formGroup.form.get(this.countryCodeControlName)
      if (countryCodeControl) {
        if (!countryCodeControl.value) {
          countryCodeControl.setValue(this.defaultCountryCode)
        }
        // Watch for country code changes
        countryCodeControl.valueChanges.subscribe(() => {
          this.updateCombinedPhoneNumber()
        })
      }
    }
  }

  override onInputChange(event: Event): void {
    this.formatPhoneNumber(event)
  }

  private updateCombinedPhoneNumber(): void {
    if (!this.countryCode || !this.countryCodeControlName) return
    
    const countryCodeControl = this.formGroup.form.get(this.countryCodeControlName)
    const phoneValue = this.control.value || ''
    
    if (countryCodeControl && phoneValue) {
      const countryCode = countryCodeControl.value || this.defaultCountryCode
      // Remove any existing country code from phone value
      const cleanPhone = phoneValue.replace(/^\+\d{1,3}\s?/, '')
      // Combine country code with phone number
      const combined = `${countryCode} ${cleanPhone}`.trim()
      this.control.setValue(combined, { emitEvent: false })
    }
  }

  getCountryCodeControl(): FormControl | null {
    if (!this.countryCode || !this.countryCodeControlName) return null
    const control = this.formGroup.form.get(this.countryCodeControlName)
    if (!control) {
      console.warn(`Country code control "${this.countryCodeControlName}" not found in form`)
      return null
    }
    return control as FormControl
  }

  formatPhoneNumber(event: Event) {
    const input = event.target as HTMLInputElement;
    let value = input.value.replace(/\D/g, ''); 
    
    // If we have a separate country code control, remove country code from value
    if (this.countryCode && this.countryCodeControlName) {
      const countryCodeControl = this.formGroup.form.get(this.countryCodeControlName)
      if (countryCodeControl) {
        const countryCode = countryCodeControl.value || this.defaultCountryCode
        const codeDigits = countryCode.replace(/\D/g, '')
        // Remove country code digits if they match the start
        if (value.startsWith(codeDigits)) {
          value = value.substring(codeDigits.length)
        }
      }
    }
    
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
    
    // Store just the phone number (without country code) in the control
    // Country code is stored separately
    this.formGroup.form.patchValue({
      [this.controlName]: value
    }, { emitEvent: false });
  }
}
