import { NgModule, input } from "@angular/core"
import { FormsModule, ReactiveFormsModule } from "@angular/forms"
import { TranslateModule } from "@ngx-translate/core"
import { CommonModule } from "@angular/common"
import { WeekdaysPipe } from "./pipes/WeekdaysPipe"
import { TimeFormatPipe } from "./pipes/TimeFormat.pipe"
import { CapitalizePipe } from "./pipes/Capitalize.pipe"
import { MatButtonModule } from "@angular/material/button"
import { MatCardModule } from "@angular/material/card"
import { MatIconModule } from "@angular/material/icon"
import { MatInputModule } from "@angular/material/input"
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner"
import { MatSnackBarModule } from "@angular/material/snack-bar"
import { MatSelectModule } from "@angular/material/select"
import { MatFormFieldModule } from "@angular/material/form-field"
import { MatAutocompleteModule } from "@angular/material/autocomplete"
import { MatDatepickerModule } from "@angular/material/datepicker"
import { AutocompleteDropdownComponent } from "./components/controls/autocomplete-dropdown/autocomplete-dropdown.component"
import { DropdownComponent } from "./components/controls/dropdown/dropdown.component"
import { LanguageSelectorComponent } from "./components/language-selector/language-selector.component"
import { TextInputComponent } from "./components/controls/text-input/text-input.component"
import { MultiSelectChipsComponent } from "./components/controls/multi-select-chips/multi-select-chips.component"
import { SubmitButtonComponent } from "./components/buttons/submit-button/submit-button.component"
import { DatepickerComponent } from "./components/controls/datepicker/datepicker.component"
import { RouterModule } from "@angular/router"
import { ButtonComponent } from "./components/buttons/button/button.component"
import { ModalComponent } from "./components/modal/modal.component"

const materialModules = [
  MatAutocompleteModule,
  MatCardModule,
  MatDatepickerModule,
  MatInputModule,
  MatButtonModule,
  MatIconModule,
  MatProgressSpinnerModule,
  MatSnackBarModule,
  MatSelectModule,    
  MatFormFieldModule,
]

const inputComponents = [
  AutocompleteDropdownComponent,
  DropdownComponent,
  LanguageSelectorComponent,
  MultiSelectChipsComponent,
  TextInputComponent,
  SubmitButtonComponent,
  ButtonComponent,
  DatepickerComponent
]

const pipes = [ 
  CapitalizePipe,
  TimeFormatPipe,
  WeekdaysPipe
]

@NgModule({
  declarations: [
    ...inputComponents,
    ...pipes,
    ModalComponent
  ],
  imports: [
    ...materialModules,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    TranslateModule,
    RouterModule
  ],
  exports: [
    ...materialModules, 
    ...inputComponents, 
    ...pipes,
    ModalComponent,
    FormsModule,
    ReactiveFormsModule,
    TranslateModule,
    RouterModule,
  ],
  providers: [
    TimeFormatPipe,
    WeekdaysPipe
  ]
})
export class SharedModule { }