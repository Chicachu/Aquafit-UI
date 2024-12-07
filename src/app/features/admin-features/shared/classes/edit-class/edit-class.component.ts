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

@Component({
  selector: 'app-edit-class',
  templateUrl: './edit-class.component.html',
  styleUrls: ['./edit-class.component.scss']
})
export class EditClassComponent {
  readonly Pipes = Pipes
  classForm: FormGroup
  getLocations$: Observable<string[]>
  classTypes: SelectOption[] = this.convertToSelectOptions(Object.keys(ClassType))
  weekdays: SelectOption[] = Object.keys(Weekday)
    .filter(key => isNaN(Number(key)))
    .map(key => ({
      viewValue: `${key.toUpperCase()}`,
      value: Weekday[key as keyof typeof Weekday].toString()
    }))
  timeSlots = this.convertToSelectOptions(Array.from({length: 14}, (_, i) => i + 7)) 
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

  convertToSelectOptions(values: string[] | number[]): SelectOption[] {
    return values.map(value => (
      {
        viewValue: value, 
        value: value
      }
    ))
  }

  onSubmit() {
    if (this.classForm.valid) {
      const prices = [
        {
          amount: this.f['mxn'].value,
          currency: Currency.PESOS
        },
        {
          amount: this.f['usd'].value,
          currency: Currency.DOLARS
        }
      ]

      const classData: CreateClassDTO = {
        classLocation: this.f['location'].value,
        classType: this.f['class_type'].value,
        days: this.f['days'].value,
        startDate: this.f['start_date'].value,
        startTime: this.f['start_time'].value,
        prices,
        maxCapacity: this.f['max_capacity'].value
      };

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