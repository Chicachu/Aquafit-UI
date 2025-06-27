import { AbstractControl, ValidationErrors } from '@angular/forms';

export function nonEmptyArrayValidator(control: AbstractControl): ValidationErrors | null {
  const validationRsp = Array.isArray(control.value) && control.value.length > 0
    ? null
    : { required: true };
  return validationRsp
}