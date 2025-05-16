import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ClassService } from '@core/services/classService';
import { SnackBarService } from '@core/services/snackBarService';
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
  allLocations: string[] = []
  calendarOptionsForm: FormGroup 
  selectedLocation: string = ''

  constructor(private _classService: ClassService, private snackBarService: SnackBarService, private fb: FormBuilder, ) {
    this.calendarOptionsForm = this.fb.group({
      calendarView: ['MASTER']
    })

    this.calendarOptionsForm.get('calendarView')?.valueChanges.subscribe(value => {
      this.selectedLocation = value === 'MASTER' ? '' : value;
    });
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
      viewValue: "CALENDAR.MASTER"
    })

    this.allLocations.forEach((location) => {
      this.calendarLocationOptions.push({
        viewValue: location, 
        value: location
      })
    })
  }
}