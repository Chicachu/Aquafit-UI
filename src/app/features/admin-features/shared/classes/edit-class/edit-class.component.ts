import { Component } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { Observable, map, merge, of } from "rxjs";
import { ClassType } from "../../../../../core/types/enums/classType";
import { Weekday } from "../../../../../core/types/enums/weekday";
import { ClassService } from "../../../../../core/services/classService";
import { SnackBarService } from "../../../../../core/services/snackBarService";
import { TranslateService } from "@ngx-translate/core";
import { Currency } from "../../../../../core/types/enums/currency";
import { CreateClassDTO } from "../../../../../core/types/class";
import { SelectOption } from "../../../../../core/types/selectOption";
import { Pipes } from "../../../../../core/types/enums/pipes";
import { FormatOptions } from "../../../../../core/types/enums/formatOptions";

@Component({
  selector: 'app-edit-class',
  templateUrl: './edit-class.component.html',
  styleUrls: ['./edit-class.component.scss']
})
export class EditClassComponent {
  readonly Pipes = Pipes
  readonly FormatOptions = FormatOptions
  classForm: FormGroup
  getLocations$: Observable<string[]>
  classTypes: SelectOption[] = this.convertToSelectOptions(Object.keys(ClassType))
  weekdays: SelectOption[] = Object.keys(Weekday)
    .filter(key => isNaN(Number(key)))
    .map(key => ({
      viewValue: `${key.toUpperCase()}`,
      value: Weekday[key as keyof typeof Weekday].toString()
    }))
  timeSlots = this.convertToTimeOptions(Array.from({length: 14}, (_, i) => i + 7)) 
  loading = false

  constructor(
    private fb: FormBuilder, 
    private classService: ClassService,
    private snackBarService: SnackBarService,
    private translateService: TranslateService
  ) {
    this.getLocations$ = this.classService.getAllLocations()
    this.classForm = this.fb.group({
      location: [''],
      class_type: [''],
      days: [[]],
      start_date: [''],
      start_time: [''],
      mxn: [null, [Validators.required, Validators.min(0)]],
      usd: [null, [Validators.required, Validators.min(0)]],
      max_capacity: [null, [Validators.required, Validators.min(1)]]
    })
  }

  get f() { 
    return this.classForm.controls; 
  }

  convertToSelectOptions(values: string[]): SelectOption[] {
    return values.map(value => (
      {
        viewValue: value, 
        value: value
      }
    ))
  }

  convertToTimeOptions(hours: number[]): SelectOption[] {
    return hours.map(hour => ({
      value: `${hour.toString()}:00`,  
      viewValue: this.formatTimeDisplay(hour)
    }));
  }

  private formatTimeDisplay(hour: number): string {
    const period = hour >= 12 ? 'p.m.' : 'a.m.'
    const displayHour = hour % 12 || 12
    return `${displayHour}:00${period}`
   }

  onSubmit() {
    if (this.classForm.valid) {
      const prices = [
        {
          value: this.f['mxn'].value,
          currency: Currency.PESOS
        },
        {
          value: this.f['usd'].value,
          currency: Currency.DOLARS
        }
      ]

      const classData: CreateClassDTO = {
        classLocation: this.f['location'].value,
        classType: this.f['class_type'].value,
        days: this.f['days'].value,
        startDate: this.f['start_date'].value._d,
        startTime: this.f['start_time'].value,
        prices,
        maxCapacity: this.f['max_capacity'].value
      }

      this.loading = true
      this.classService.createNewClass(classData).subscribe({
        next: () => {
          this.loading = false
          this.snackBarService.showSuccess(this.translateService.instant('CLASSES.ADD_NEW_CLASS_SUCCESS'))
        },
        error: ({error}) => {
          this.loading = false
          this.snackBarService.showError(error.message)
        }
      })
    }
    else {
      this.classForm.markAllAsTouched()
    }
  }
}