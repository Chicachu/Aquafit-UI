import { Component } from '@angular/core'
import { RouterOutlet } from '@angular/router'
import { LanguageService } from './core/services/languageService';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  constructor(private languageService: LanguageService) {}

  ngOnInit() {
    this.languageService.init();
  }
}
