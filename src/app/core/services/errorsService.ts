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

  getErrorMessage(controlName: string, control: FormControl, labelKey?: string): string {
    const field = this._resolveFieldLabel(controlName, labelKey);

    if (control?.hasError('required')) {
      return this.translateService.instant('ERRORS.REQUIRED', { field });
    }
    if (control?.hasError('email')) {
      return this.translateService.instant('ERRORS.INVALID_EMAIL');
    }
    if (control?.hasError('minlength') && control.errors) {
      const error = control.errors['minlength']
      return this.translateService.instant('ERRORS.MIN_LENGTH', { field, minLength: error.requiredLength });
    }
    if (control?.hasError('maxlength') && control.errors) {
      const error = control.errors['maxlength']
      return this.translateService.instant('ERRORS.MAX_LENGTH', { field, maxLength: error.requiredLength });
    }
    if (control?.hasError('mustMatch')) {
      return this.translateService.instant('ERRORS.MUST_MATCH', { field });
    }
    if (control?.hasError('pattern')) {
      return this.translateService.instant('ERRORS.INVALID_PATTERN', { field })
    }
    if (control?.hasError('min') && control.errors) {
      const error = control.errors['min']
      if (error.min === 0) {
        return this.translateService.instant('ERRORS.POSITIVE', { field });
      } else {
        return this.translateService.instant('ERRORS.MIN', { field, min: error.min });
      }
    }
    if (control?.hasError('minDate')) {
      return this.translateService.instant('ERRORS.MIN_DATE', { field });
    }
    return '';
  }

  private _resolveFieldLabel(controlName: string, labelKey?: string): string {
    if (labelKey) {
      const fromLabel = this.translateService.instant(labelKey);
      if (fromLabel !== labelKey) {
        return fromLabel;
      }
    }

    const candidates = [
      controlName.toUpperCase(),
      controlName.replace(/([a-z])([A-Z])/g, '$1_$2').toUpperCase(),
    ];

    for (const candidate of candidates) {
      const key = `CONTROLS.${candidate}`;
      const translated = this.translateService.instant(key);
      if (translated !== key) {
        return translated;
      }
    }

    return controlName
      .replace(/_/g, ' ')
      .replace(/([a-z])([A-Z])/g, '$1 $2')
      .replace(/^\w/, (char) => char.toUpperCase());
  }
}
