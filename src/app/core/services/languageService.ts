import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { environment } from '../../../environments/environment';
import { SnackBarService } from './snackBarService';

@Injectable({
  providedIn: 'root'
})
export class LanguageService {
  constructor(private translate: TranslateService, private _http: HttpClient, private snackBarService: SnackBarService) {}

  init() {
    // Get stored preference or browser language
    const savedLang = localStorage.getItem('preferred-language');
    const browserLang = this.translate.getBrowserLang();
    const defaultLang = savedLang || (browserLang?.match(/en|es/) ? browserLang : 'en');
    
    this.translate.setDefaultLang('en');
    this.translate.use(defaultLang);
  }

  setLanguage(language: 'en' | 'es') {
    return this._http.post(`${environment.apiUrl}/language`, {language}).subscribe({
      next: (rsp) => {
        this.translate.use(language);
        localStorage.setItem('preferred-language', language);
      }, 
      error: ({error}) => {
        this.snackBarService.showError(error.message)
      }
    })
  }
}