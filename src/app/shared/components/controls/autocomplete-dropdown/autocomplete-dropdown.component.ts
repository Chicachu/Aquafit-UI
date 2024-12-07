import { Component, Input } from "@angular/core";
import { ErrorsService } from "../../../../core/services/errorsService";
import { FormGroupDirective } from "@angular/forms";
import { BaseFormControlComponent } from "../base-form-control/base-form-control.component";
import { Observable, map, merge, of } from "rxjs";
import { SnackBarService } from "../../../../core/services/snackBarService";

@Component({
  selector: 'app-autocomplete-dropdown',
  templateUrl: './autocomplete-dropdown.component.html',
  styleUrls: ['../base-form-control/base-form-control.component.scss']
})
export class AutocompleteDropdownComponent extends BaseFormControlComponent {
  @Input() getOptionsObservable!: Observable<string[]>
  existingOptions: string[] = []
  filteredOptions$: Observable<string[]> | null = null

  constructor(formGroup: FormGroupDirective, errorService: ErrorsService, private snackBarService: SnackBarService) {
    super(formGroup, errorService)
  }

  override ngOnInit(): void {
    super.ngOnInit()
    if (this.getOptionsObservable && this.control) {
      this.getOptionsObservable.subscribe({
        next: (options: string[]) => {
          this.existingOptions = options
          this.filteredOptions$ = merge(
            of(options), 
            this.control?.valueChanges.pipe(
              map(value => this._filter(value || ''))
            )
          )
        },
        error: ({error}) => {
          this.snackBarService.showError(error.message)
        }
      })
    }
  }

  private _filter(value: string): string[] {
    const filterValue = value.toLowerCase();
    return this.existingOptions.filter(option => 
      option.toLowerCase().includes(filterValue)
    )
  }
}