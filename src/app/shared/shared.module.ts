import { NgModule } from "@angular/core"
import { FormsModule, ReactiveFormsModule } from "@angular/forms"
import { MatButtonModule } from "@angular/material/button"
import { MatCardModule } from "@angular/material/card"
import { MatIconModule } from "@angular/material/icon"
import { MatInputModule } from "@angular/material/input"
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner"
import { MatSnackBarModule } from "@angular/material/snack-bar"
import { TranslateModule } from "@ngx-translate/core"
import { LanguageSelectorComponent } from "./components/languageSelector/language-selector.component"
import { MatSelectModule } from "@angular/material/select"
import { MatFormFieldModule } from "@angular/material/form-field"

const materialModules = [
  MatCardModule,
  MatInputModule,
  MatButtonModule,
  MatIconModule,
  MatProgressSpinnerModule,
  MatSnackBarModule,
  MatSelectModule,    
  MatFormFieldModule
]

@NgModule({
  declarations: [
    LanguageSelectorComponent
  ],
  imports: [
    ...materialModules,
    FormsModule,
    ReactiveFormsModule,
    TranslateModule
  ],
  exports: [
    ...materialModules,
    FormsModule,
    ReactiveFormsModule,
    TranslateModule,
    LanguageSelectorComponent
  ],
})
export class SharedModule { }