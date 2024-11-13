import { Component, Input } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { LanguageService } from '../../../core/services/languageService';
import { trigger, state, style, animate, transition } from '@angular/animations';

@Component({
  selector: 'app-language-selector',
  templateUrl: './language-selector.component.html',
  styleUrls: ['./language-selector.component.scss'],
  animations: [
    trigger('slideToggle', [
      state('en', style({ transform: 'translateX(.15rem)' })),
      state('es', style({ transform: 'translateX(2.4rem)' })),
      transition('en <=> es', animate('200ms ease-in-out'))
    ])
  ]
})
export class LanguageSelectorComponent {
  @Input() isDark = true

  currentLang: 'en' | 'es' = 'en';

  constructor(
    public translate: TranslateService,
    public languageService: LanguageService
  ) {
    this.currentLang = languageService.getLanguage()
  }

  toggleLanguage(): void {
    this.currentLang = this.currentLang === 'en' ? 'es' : 'en';
    console.log(this.currentLang)
    this.languageService.setLanguage(this.currentLang)
  }
}