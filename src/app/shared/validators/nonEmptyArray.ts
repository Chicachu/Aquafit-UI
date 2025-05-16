import { AbstractControl, ValidationErrors } from '@angular/forms';

export function nonEmptyArrayValidator(control: AbstractControl): ValidationErrors | null {
  return Array.isArray(control.value) && control.value.length > 0
    ? null
    : { emptyArray: true };
}