import { HttpClient } from '@angular/common/http';
import { EventEmitter, Injectable, Output } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { environment } from '../../../environments/environment';
import { SnackBarService } from './snackBarService';
import { Language } from '../types/enums/language';

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

  getLanguage(): Language {
    let language = 'en'
    
    const browserLang = this.translate.getBrowserLang()
    if (browserLang && Object.values(Language).includes(browserLang as Language)) language = browserLang

    const savedLang = localStorage.getItem('preferred-language')

    if (savedLang && Object.values(Language).includes(savedLang as Language)) language = savedLang
    return language as Language
  }

  notifyLanguage(): void {
    this.notifyPreferredLanguage.emit(this.getLanguage())
  }
}