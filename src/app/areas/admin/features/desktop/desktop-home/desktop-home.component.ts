import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ClassService } from '@core/services/classService';
import { SnackBarService } from '@core/services/snackBarService';
import { FormatOptions } from '@core/types/enums/formatOptions';
import { SelectOption } from '@core/types/selectOption';

@Component({
  selector: 'app-desktop-home',
  templateUrl: './desktop-home.component.html',
  styleUrl: './desktop-home.component.scss'
})
export class DesktopHomeComponent implements OnInit {
  readonly FormatOptions = FormatOptions;
  calendarLocationOptions: SelectOption[] = [];
  calendarOptionsForm: FormGroup;
  selectedLocation = '';

  constructor(
    private classService: ClassService,
    private snackBarService: SnackBarService,
    private fb: FormBuilder
  ) {
    this.calendarOptionsForm = this.fb.group({
      calendarView: ['MASTER']
    });

    this.calendarOptionsForm.get('calendarView')?.valueChanges.subscribe(value => {
      this.selectedLocation = value === 'MASTER' ? '' : value;
    });
  }

  ngOnInit(): void {
    this.classService.getAllLocations().subscribe({
      next: (res: string[]) => {
        this._generateCalendarLocationOptions(res);
      },
      error: ({ error }) => {
        this.snackBarService.showError(error.message);
      }
    });
  }

  private _generateCalendarLocationOptions(locations: string[]): void {
    this.calendarLocationOptions = [
      { value: 'MASTER', viewValue: 'CALENDAR.MASTER' },
      ...locations.map(location => ({ value: location, viewValue: location }))
    ];
  }
}
