import { Component } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { PaymentService } from "@core/services/paymentService";
import { SnackBarService } from "@core/services/snackBarService";
import { InvoiceDetails } from "@core/types/invoices/invoiceDetails";
import { ButtonType } from "../../breadcrumb-nav-bar/breadcrumb-nav-bar.component";
import { PaymentStatus } from "@core/types/enums/paymentStatus";
import { TranslateService } from "@ngx-translate/core";

@Component({
  selector: 'app-invoice-details',
  templateUrl: './invoice-details.component.html',
  styleUrls: ['./invoice-details.component.scss']
})
export class InvoiceDetailsComponent {
  constructor(
    private _route: ActivatedRoute, 
    private _paymentService: PaymentService,
    private _snackBarService: SnackBarService,
    private _translateService: TranslateService
  ) {}
  ButtonType = ButtonType
  invoiceId: string = ''
  userId: string = ''
  enrollmentId: string = ''
  invoiceDetails: InvoiceDetails | null = null 

  ngOnInit(): void {
    this.invoiceId = this._route.snapshot.paramMap.get('invoice-id')!
    this.userId = this._route.snapshot.paramMap.get('user-id')!
    this.enrollmentId = this._route.snapshot.paramMap.get('enrollment-id')!

    this._paymentService.getInvoice(this.userId, this.enrollmentId, this.invoiceId).subscribe({
      next: (invoiceDetails: InvoiceDetails) => {
        console.log(invoiceDetails)
        this.invoiceDetails = invoiceDetails
      },
      error: ({error}) => {
        this._snackBarService.showError(error.message)
      }
    })
  }

  public getStatusClass(paymentStatus: PaymentStatus): string {
      switch (paymentStatus) {
        case PaymentStatus.PAID: 
          return 'paid-status'
        case PaymentStatus.ALMOST_DUE: 
          return 'almost-due-status'
        case PaymentStatus.OVERDUE: 
          return 'overdue-status'
        case PaymentStatus.PENDING: 
          return 'pending-status'
        default: 
          return ''
      }
    }

  public getDiscountAmount(discount: any): number {
    if (discount.amountSnapshot?.amount != null) {
      return discount.amountSnapshot.amount
    }
    if (discount.amountOverride?.amount != null) {
      return discount.amountOverride.amount
    }
    return 0
  }

  public getDiscountCurrency(discount: any): string {
    if (discount.amountSnapshot?.currency) {
      return discount.amountSnapshot.currency
    }
    if (discount.amountOverride?.currency) {
      return discount.amountOverride.currency
    }
    return 'MXN'
  }

  public getTranslatedDiscountDescription(description: string | null | undefined): string {
    if (!description) {
      return this._translateService.instant('DISCOUNTS.DEFAULT_DESCRIPTION')
    }

    // Handle class termination refund
    const terminationMatch = description.match(/Class termination refund for (\d+) remaining session\(s\)/)
    if (terminationMatch) {
      const sessions = parseInt(terminationMatch[1])
      const sessionKey = sessions === 1 ? 'SESSION_SINGULAR' : 'SESSION_PLURAL'
      const remainingKey = sessions === 1 ? 'REMAINING_SINGULAR' : 'REMAINING_PLURAL'
      return this._translateService.instant('DISCOUNTS.CLASS_TERMINATION_REFUND', { 
        sessions,
        sessionWord: this._translateService.instant(`DISCOUNTS.${sessionKey}`),
        remainingWord: this._translateService.instant(`DISCOUNTS.${remainingKey}`)
      })
    }

    // Handle partial enrollment with days
    const partialDaysMatch = description.match(/Partial Enrollment \((\d+)\/(\d+) days\)/)
    if (partialDaysMatch) {
      const daysAttending = partialDaysMatch[1]
      const totalDays = partialDaysMatch[2]
      return this._translateService.instant('DISCOUNTS.PARTIAL_ENROLLMENT_DAYS', { daysAttending, totalDays })
    }

    // Handle simple partial enrollment
    if (description === 'Partial Enrollment Discount') {
      return this._translateService.instant('DISCOUNTS.PARTIAL_ENROLLMENT')
    }

    // For any other description, try to translate it directly or return as-is
    // Check if it matches a known discount type translation key
    const translationKey = `DISCOUNTS.${description.toUpperCase().replace(/\s+/g, '_')}`
    const translated = this._translateService.instant(translationKey)
    
    // If translation key doesn't exist, it returns the key itself, so return original description
    return translated !== translationKey ? translated : description
  }
}