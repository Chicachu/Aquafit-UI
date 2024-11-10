import { FormGroup } from '@angular/forms';

export function MustMatch(controlName: string, matchingControlName: string) {
  return (formGroup: FormGroup) => {
    const control = formGroup.get(controlName);
    const matchingControl = formGroup.get(matchingControlName);

    if (matchingControl?.errors && !matchingControl.errors['mustMatch']) {
      return;
    }

    if (control?.value !== matchingControl?.value) {
      matchingControl?.setErrors({ mustMatch: true });
    } else {
      matchingControl?.setErrors(null);
    }
  };
}