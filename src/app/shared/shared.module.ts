import { NgModule } from "@angular/core"
import { FormsModule, ReactiveFormsModule } from "@angular/forms"
import { MatButtonModule } from "@angular/material/button"
import { MatCardModule } from "@angular/material/card"
import { MatIconModule } from "@angular/material/icon"
import { MatInputModule } from "@angular/material/input"
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner"
import { MatSnackBarModule } from "@angular/material/snack-bar"
import { TranslateModule } from "@ngx-translate/core"
import { LanguageSelectorComponent } from "./components/language-selector/language-selector.component"
import { MatSelectModule } from "@angular/material/select"
import { MatFormFieldModule } from "@angular/material/form-field"
import { CommonModule } from "@angular/common"
import { BrowserAnimationsModule } from "@angular/platform-browser/animations"
import { WeekdaysPipe } from "./pipes/WeekdaysPipe"
import { TimeFormatPipe } from "./pipes/TimeFormat.pipe"
import { CapitalizePipe } from "./pipes/Capitalize.pipe"

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
    LanguageSelectorComponent,
    CapitalizePipe,
    TimeFormatPipe,
    WeekdaysPipe
  ],
  imports: [
    ...materialModules,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    TranslateModule
  ],
  exports: [
    ...materialModules,
    FormsModule,
    ReactiveFormsModule,
    TranslateModule,
    CapitalizePipe,
    LanguageSelectorComponent,
    TimeFormatPipe,
    WeekdaysPipe
  ],
})
export class SharedModule { }