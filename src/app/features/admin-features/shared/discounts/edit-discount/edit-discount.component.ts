import { Component, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import { DiscountService } from "@/core/services/discountService";
import { SnackBarService } from "@/core/services/snackBarService";
import { TranslateService } from "@ngx-translate/core";
import { DiscountType } from "@/core/types/enums/discountType";
import { SelectOption } from "@/core/types/selectOption";
import { Discount } from "@/core/types/discounts/discount";

@Component({
  selector: 'app-edit-discount',
  templateUrl: './edit-discount.component.html',
  styleUrls: ['./edit-discount.component.scss']
})
export class EditDiscountComponent implements OnInit {
  discountForm: FormGroup
  discountTypes: SelectOption[] = Object.keys(DiscountType)
    .filter(key => isNaN(Number(key)))
    .map(key => ({
      viewValue: DiscountType[key as keyof typeof DiscountType],
      value: DiscountType[key as keyof typeof DiscountType]
    }))
  loading = false
  isEditMode = false
  discountId: string | null = null

  constructor(
    private fb: FormBuilder,
    private discountService: DiscountService,
    private snackBarService: SnackBarService,
    private translateService: TranslateService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.discountForm = this.fb.group({
      description: ['', [Validators.required]],
      type: ['', [Validators.required]],
      amount: [null, [Validators.min(0)]],
      start_date: ['', [Validators.required]],
      end_date: [null, []]
    })

    // Update amount validation based on discount type
    this.discountForm.get('type')?.valueChanges.subscribe((type: DiscountType) => {
      const amountControl = this.discountForm.get('amount')
      if (type === DiscountType.PERCENTAGE || type === DiscountType.FLAT) {
        amountControl?.setValidators([Validators.required, Validators.min(0)])
        if (type === DiscountType.PERCENTAGE) {
          amountControl?.addValidators(Validators.max(100))
        }
      } else {
        amountControl?.setValidators([Validators.min(0)])
      }
      amountControl?.updateValueAndValidity()
    })
  }

  ngOnInit(): void {
    this.discountId = this.route.snapshot.paramMap.get('discount-id')
    this.isEditMode = !!this.discountId

    if (this.isEditMode && this.discountId) {
      this.discountService.getDiscount(this.discountId).subscribe({
        next: (discount: any) => {
          // Handle both API format (startDate/endDate) and UI format (period)
          const startDate = discount.startDate || discount.period?.startDate
          const endDate = discount.endDate || discount.period?.endDate
          
          // Convert to Date objects if they're strings
          const startDateObj = startDate 
            ? (startDate instanceof Date ? startDate : new Date(startDate))
            : null
          const endDateObj = endDate 
            ? (endDate instanceof Date ? endDate : new Date(endDate))
            : null
          
          this.discountForm.patchValue({
            description: discount.description,
            type: discount.type,
            amount: discount.amount || null,
            start_date: startDateObj,
            end_date: endDateObj
          })
          
          // Trigger validation update for amount based on discount type
          const amountControl = this.discountForm.get('amount')
          if (discount.type === DiscountType.PERCENTAGE || discount.type === DiscountType.FLAT) {
            amountControl?.setValidators([Validators.required, Validators.min(0)])
            if (discount.type === DiscountType.PERCENTAGE) {
              amountControl?.addValidators(Validators.max(100))
            }
          } else {
            amountControl?.setValidators([Validators.min(0)])
          }
          amountControl?.updateValueAndValidity()
        },
        error: ({error}) => {
          this.snackBarService.showError(error.message)
        }
      })
    }
  }

  get f() {
    return this.discountForm.controls
  }

  onSubmit() {
    if (this.discountForm.valid) {
      const formValue = this.discountForm.value
      const startDate = formValue.start_date._d || formValue.start_date
      const endDate = formValue.end_date?._d || formValue.end_date || null
      
      // API expects startDate/endDate directly, not in a period object
      const discountData: any = {
        description: formValue.description.trim(),
        type: formValue.type
      }
      
      // Only include amount if it's provided (some discount types don't need it)
      if (formValue.amount !== null && formValue.amount !== undefined) {
        discountData.amount = formValue.amount
      }
      
      // Include period with startDate/endDate
      discountData.period = {
        startDate: startDate,
        endDate: endDate || undefined
      }

      this.loading = true

      if (this.isEditMode && this.discountId) {
        this.discountService.updateDiscount(this.discountId, discountData).subscribe({
          next: () => {
            this.loading = false
            this.snackBarService.showSuccess(this.translateService.instant('DISCOUNTS.UPDATE_SUCCESS'))
            this.router.navigate(['../../', this.discountId, 'details'], { relativeTo: this.route.parent })
          },
          error: ({error}) => {
            this.loading = false
            this.snackBarService.showError(error.message)
          }
        })
      } else {
        this.discountService.createDiscount(discountData).subscribe({
          next: (discount: Discount) => {
            this.loading = false
            this.snackBarService.showSuccess(this.translateService.instant('DISCOUNTS.CREATE_SUCCESS'))
            this.router.navigate(['../', discount._id, 'details'], { relativeTo: this.route.parent })
          },
          error: ({error}) => {
            this.loading = false
            this.snackBarService.showError(error.message)
          }
        })
      }
    } else {
      this.discountForm.markAllAsTouched()
    }
  }
}
