import { Pipe, PipeTransform } from '@angular/core';
import { DatePipe } from '@angular/common';
import { TranslateService } from '@ngx-translate/core';

@Pipe({ name: 'translateDate', pure: false })
export class TranslateDatePipe implements PipeTransform {
  constructor(private translate: TranslateService) {}

  transform(value: any, format: string = 'shortDate'): string | null {
    const locale = this.translate.currentLang || 'en';
    return new DatePipe(locale).transform(value, format);
  }
}