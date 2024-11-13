import { HttpClient } from '@angular/common/http';
import { EventEmitter, Injectable, Output } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { environment } from '../../../environments/environment';
import { SnackBarService } from './snackBarService';
import { Languages } from '../types/enums/languages';

@Injectable({
  providedIn: 'root'
})
export class LanguageService {
  @Output() notifyPreferredLanguage = new EventEmitter<string>()

  constructor(private translate: TranslateService, private _http: HttpClient, private snackBarService: SnackBarService) {}

  init() {
    const defaultLang = this.getLanguage()
    
    this.translate.setDefaultLang('en');
    this.translate.use(defaultLang);
  }

  setLanguage(language: 'en' | 'es'): void {
    this._http.post(`${environment.apiUrl}/languages`, {language}).subscribe({
      next: () => {
        this.translate.use(language);
        localStorage.setItem('preferred-language', language);
      }, 
      error: ({error}) => {
        this.snackBarService.showError(error.message)
      }
    })
  }

  getLanguage(): Languages {
    let language = 'en'
    
    const browserLang = this.translate.getBrowserLang()
    if (browserLang && Object.values(Languages).includes(browserLang as Languages)) language = browserLang

    const savedLang = localStorage.getItem('preferred-language')

    if (savedLang && Object.values(Languages).includes(savedLang as Languages)) language = savedLang
    return language as Languages
  }

  notifyLanguage(): void {
    this.notifyPreferredLanguage.emit(this.getLanguage())
  }
}