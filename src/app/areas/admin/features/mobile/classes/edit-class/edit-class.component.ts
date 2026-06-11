import { Component, HostBinding, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { Observable } from "rxjs";
import { map, switchMap } from "rxjs/operators";
import { ClassType } from "@/core/types/enums/classType";
import { Weekday } from "@/core/types/enums/weekday";
import { ClassService } from "@/core/services/classService";
import { SnackBarService } from "@/core/services/snackBarService";
import { TranslateService } from "@ngx-translate/core";
import { Currency } from "@/core/types/enums/currency";
import { Class, CreateClassDTO } from "@/core/types/classes/class";
import { SelectOption } from "@/core/types/selectOption";
import { Pipes } from "@/core/types/enums/pipes";
import { FormatOptions } from "@/core/types/enums/formatOptions";
import { ActivatedRoute, Router } from "@angular/router";
import { nonEmptyArrayValidator } from "@shared/validators/nonEmptyArray";
import { BillingFrequency } from "@core/types/enums/billingFrequency";

@Component({
  selector: 'app-edit-class',
  templateUrl: './edit-class.component.html',
  styleUrls: ['./edit-class.component.scss']
})
export class EditClassComponent implements OnInit {
  @HostBinding('class.panel-view') panelView = false

  readonly Pipes = Pipes
  readonly FormatOptions = FormatOptions
  classForm: FormGroup
  getLocations$: Observable<string[]>
  classTypes: SelectOption[] = this.convertToSelectOptions(Object.keys(ClassType))
  weekdays: SelectOption[] = Object.keys(Weekday)
    .filter(key => isNaN(Number(key)))
    .map(key => ({
      viewValue: key.toUpperCase(),
      value: Weekday[key as keyof typeof Weekday]
    }))
  timeSlots = this.convertToTimeOptions(Array.from({length: 14}, (_, i) => i + 7)) 
  billingFrequencyOptions: SelectOption[] = Object.keys(BillingFrequency)
    .map(key => ({
      viewValue: key.toUpperCase(),
      value: BillingFrequency[key as keyof typeof BillingFrequency].toString()
    }))
  loading = false
  isEditMode = false
  classId: string | null = null

  constructor(
    private fb: FormBuilder, 
    private classService: ClassService,
    private snackBarService: SnackBarService,
    private translateService: TranslateService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.getLocations$ = this.classService.getAllLocations()
    this.classForm = this.fb.group({
      location: ['', [Validators.required]],
      class_type: ['', [Validators.required]],
      days: [[], [nonEmptyArrayValidator]],
      start_date: ['', [Validators.required]],
      start_time: ['', [Validators.required]],
      mxn: [null, [Validators.required, Validators.min(0)]],
      billing_frequency: [null, [Validators.required]],
      max_capacity: [null, [Validators.required, Validators.min(1)]]
    })
  }

  ngOnInit(): void {
    if (this.route.snapshot.data['panelView'] === true) {
      this.panelView = true
    }

    this.classId = this.route.snapshot.paramMap.get('class-id')
    this.isEditMode = !!this.classId

    if (this.isEditMode && this.classId) {
      this.classService.getClass(this.classId).subscribe({
        next: (classData: any) => {
          // Handle date conversion - API returns string, need Date object for datepicker
          const startDate = classData.startDate instanceof Date 
            ? classData.startDate 
            : new Date(classData.startDate)
          
          // Ensure time format matches dropdown format (HH:00)
          let startTime = classData.startTime
          if (startTime && !startTime.includes(':')) {
            // If time is just a number, format it
            startTime = `${startTime}:00`
          } else if (startTime && startTime.split(':').length === 2) {
            // Ensure format is HH:00
            const [hours] = startTime.split(':')
            startTime = `${hours}:00`
          }
          
          // Ensure days are numbers
          const days = Array.isArray(classData.days) 
            ? classData.days.map((day: any) => typeof day === 'string' ? parseInt(day) : day)
            : classData.days

          this.classForm.patchValue({
            location: classData.classLocation,
            class_type: classData.classType,
            days: days,
            start_date: startDate,
            start_time: startTime,
            mxn: classData.prices?.[0]?.amount || null,
            billing_frequency: classData.billingFrequency?.toString() || classData.billingFrequency,
            max_capacity: classData.maxCapacity
          })
        },
        error: ({error}) => {
          this.snackBarService.showError(error.message)
        }
      })
    }
  }

  get f() { 
    return this.classForm.controls
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
      viewValue: hour.toString()
    }));
  }

  onSubmit() {
    if (this.classForm.valid) {
      const prices = [
        {
          amount: this.f['mxn'].value,
          currency: Currency.PESOS
        }
      ]

      const classData: CreateClassDTO = {
        classLocation: this.f['location'].value,
        classType: this.f['class_type'].value,
        days: this.f['days'].value,
        startDate: this.f['start_date'].value._d,
        startTime: this.f['start_time'].value,
        prices,
        billingFrequency: this.f['billing_frequency'].value,
        maxCapacity: this.f['max_capacity'].value
      }

      this.loading = true

      if (this.isEditMode && this.classId) {
        this.classService.updateClass(this.classId, classData).subscribe({
          next: () => {
            this.loading = false
            this.snackBarService.showSuccess(this.translateService.instant('CLASSES.UPDATE_CLASS_SUCCESS'))
            this._navigateAfterSave()
          },
          error: ({error}) => {
            this.loading = false
            this.snackBarService.showError(error.message)
          }
        })
      } else {
        const create$ = this.panelView
          ? this.classService.getAllClasses().pipe(
              switchMap(existingClasses => {
                const existingIds = new Set(existingClasses.map(classItem => classItem._id))
                return this.classService.createNewClass(classData).pipe(
                  switchMap(() => this.classService.getAllClasses()),
                  map(classes => classes.find(classItem => !existingIds.has(classItem._id)) ?? null)
                )
              })
            )
          : this.classService.createNewClass(classData).pipe(map(() => null))

        create$.subscribe({
          next: (createdClass: Class | null) => {
            this.loading = false
            this.snackBarService.showSuccess(this.translateService.instant('CLASSES.ADD_NEW_CLASS_SUCCESS'))
            if (this.panelView && createdClass) {
              this.router.navigate(['/admin/classes', createdClass._id, 'details'])
              return
            }

            this._navigateAfterSave()
          },
          error: ({error}) => {
            this.loading = false
            this.snackBarService.showError(error.message)
          }
        })
      }
    }
    else {
      this.classForm.markAllAsTouched()
    }
  }

  private _navigateAfterSave(): void {
    if (this.panelView && this.isEditMode && this.classId) {
      this.router.navigate(['/admin/classes', this.classId, 'details'])
      return
    }

    if (this.panelView) {
      this.router.navigate(['/admin/classes'])
      return
    }

    if (this.isEditMode) {
      this.router.navigate(['../..'], { relativeTo: this.route.parent })
      return
    }

    this.router.navigate(['../'], { relativeTo: this.route })
  }
}