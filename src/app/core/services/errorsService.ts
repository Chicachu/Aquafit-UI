import { Injectable } from "@angular/core";
import { FormControl } from "@angular/forms";
import { TranslateService } from "@ngx-translate/core";

export interface ErrorMessageProvider {
  getErrorMessage(): string
}

@Injectable({
  providedIn: 'root'
})
export class ErrorsService {
  constructor(private translateService: TranslateService) {}

  getErrorMessage(controlName: string, control: FormControl): string {
    if (control?.hasError('required')) {
      return this.translateService.instant('ERRORS.REQUIRED', { field: this.translateService.instant(`CONTROLS.${controlName.toUpperCase()}`) });;
    }
    if (control?.hasError('email')) {
      return this.translateService.instant('ERRORS.INVALID_EMAIL');
    }
    if (control?.hasError('minlength') && control.errors) {
      const error = control.errors['minlength']
      return this.translateService.instant('ERRORS.MIN_LENGTH', { field: this.translateService.instant(`CONTROLS.${controlName.toUpperCase()}`), minLength: error.requiredLength });
    }
    if (control?.hasError('maxlength') && control.errors) {
      const error = control.errors['maxlength']
      return this.translateService.instant('ERRORS.MIN_LENGTH', { field: this.translateService.instant(`CONTROLS.${controlName.toUpperCase()}`), minLength: error.requiredLength });
    }
    if (control?.hasError('mustMatch')) {
      return this.translateService.instant('ERRORS.MUST_MATCH', { field: this.translateService.instant(`CONTROLS.${controlName.toUpperCase()}`) });
    }
    if (control?.hasError('pattern')) {
      return this.translateService.instant('ERRORS.INVALID_PATTERN', { field: this.translateService.instant(`CONTROLS.${controlName.toUpperCase()}`) })
    }
    if (control?.hasError('min') && control.errors) {
      const error = control.errors['min']
      if (error.min === 0) {
        return this.translateService.instant('ERRORS.POSITIVE', { field: this.translateService.instant(`CONTROLS.${controlName.toUpperCase()}`) });
      } else {
        return this.translateService.instant('ERRORS.MIN', { field: this.translateService.instant(`CONTROLS.${controlName.toUpperCase()}`), min: error.min });
      }
    }
    if (control?.hasError('minDate')) {
      return this.translateService.instant('ERRORS.MIN_DATE', { field: this.translateService.instant(`CONTROLS.${controlName.toUpperCase()}`) });
    }
    return '';
  }
}
