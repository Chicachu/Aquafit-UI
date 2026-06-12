import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ClassService } from '@core/services/classService';
import { SnackBarService } from '@core/services/snackBarService';
import { ClassType } from '@core/types/enums/classType';
import { FormatOptions } from '@core/types/enums/formatOptions';
import { SelectOption } from '@core/types/selectOption';

@Component({
  selector: 'app-mobile-home',
  templateUrl: './mobile-home.component.html',
  styleUrls: ['./mobile-home.component.scss']
})
export class MobileHomeComponent implements OnInit {
  readonly FormatOptions = FormatOptions
  calendarLocationOptions: SelectOption[] = []
  calendarClassTypeOptions: SelectOption[] = []
  allLocations: string[] = []
  calendarOptionsForm: FormGroup
  selectedLocation: string = ''
  selectedClassType: string = ''

  constructor(private _classService: ClassService, private snackBarService: SnackBarService, private fb: FormBuilder, ) {
    this.calendarOptionsForm = this.fb.group({
      calendarView: ['MASTER'],
      classType: ['ALL']
    })

    this.calendarOptionsForm.get('calendarView')?.valueChanges.subscribe(value => {
      this.selectedLocation = value === 'MASTER' ? '' : value;
    });

    this.calendarOptionsForm.get('classType')?.valueChanges.subscribe(value => {
      this.selectedClassType = value === 'ALL' ? '' : value;
    });

    this._generateCalendarClassTypeOptions()
  }

  ngOnInit(): void {
    this._classService.getAllLocations().subscribe({
      next: (res: string[]) => {
        this.allLocations = res
        this._generateCalendarLocationOptions()
      },
      error: ({error}) => {
        this.snackBarService.showError(error.message)
      }
    })
  }

  private _generateCalendarLocationOptions(): void {
    this.calendarLocationOptions.push({
      value: "MASTER",
      viewValue: "CLASSES.ALL_LOCATIONS"
    })

    this.allLocations.forEach((location) => {
      this.calendarLocationOptions.push({
        viewValue: location,
        value: location
      })
    })
  }

  private _generateCalendarClassTypeOptions(): void {
    this.calendarClassTypeOptions = [
      { value: 'ALL', viewValue: 'CLASSES.ALL_TYPES' },
      ...Object.values(ClassType).map(classType => ({
        value: classType,
        viewValue: `CLASS_TYPES.${classType}`
      }))
    ]
  }
}
