import { Component, HostBinding, Input, OnChanges, OnInit, SimpleChanges } from "@angular/core";
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
export class InvoiceDetailsComponent implements OnInit, OnChanges {
  @Input() @HostBinding('class.panel-view') panelView = false
  @Input() userId: string | null = null
  @Input() enrollmentId: string | null = null
  @Input() invoiceId: string | null = null

  ButtonType = ButtonType
  invoiceDetails: InvoiceDetails | null = null

  constructor(
    private route: ActivatedRoute,
    private paymentService: PaymentService,
    private snackBarService: SnackBarService,
    private translateService: TranslateService
  ) {}

  ngOnInit(): void {
    if (this.route.snapshot.data['panelView'] === true) {
      this.panelView = true
    }

    if (this.panelView && this.userId && this.enrollmentId && this.invoiceId) {
      this._loadInvoice()
      return
    }

    if (!this.panelView) {
      this.invoiceId = this.route.snapshot.paramMap.get('invoice-id')
      this.userId = this.route.snapshot.paramMap.get('user-id')
      this.enrollmentId = this.route.snapshot.paramMap.get('enrollment-id')
      this._loadInvoice()
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (
      this.panelView
      && (changes['userId'] || changes['enrollmentId'] || changes['invoiceId'])
      && this.userId
      && this.enrollmentId
      && this.invoiceId
    ) {
      this._loadInvoice()
    }
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
      return this.translateService.instant('DISCOUNTS.DEFAULT_DESCRIPTION')
    }

    const terminationMatch = description.match(/Class termination refund for (\d+) remaining session\(s\)/)
    if (terminationMatch) {
      const sessions = parseInt(terminationMatch[1])
      const sessionKey = sessions === 1 ? 'SESSION_SINGULAR' : 'SESSION_PLURAL'
      const remainingKey = sessions === 1 ? 'REMAINING_SINGULAR' : 'REMAINING_PLURAL'
      return this.translateService.instant('DISCOUNTS.CLASS_TERMINATION_REFUND', { 
        sessions,
        sessionWord: this.translateService.instant(`DISCOUNTS.${sessionKey}`),
        remainingWord: this.translateService.instant(`DISCOUNTS.${remainingKey}`)
      })
    }

    const partialDaysMatch = description.match(/Partial Enrollment \((\d+)\/(\d+) days\)/)
    if (partialDaysMatch) {
      const daysAttending = partialDaysMatch[1]
      const totalDays = partialDaysMatch[2]
      return this.translateService.instant('DISCOUNTS.PARTIAL_ENROLLMENT_DAYS', { daysAttending, totalDays })
    }

    if (description === 'Partial Enrollment Discount') {
      return this.translateService.instant('DISCOUNTS.PARTIAL_ENROLLMENT')
    }

    const translationKey = `DISCOUNTS.${description.toUpperCase().replace(/\s+/g, '_')}`
    const translated = this.translateService.instant(translationKey)
    
    return translated !== translationKey ? translated : description
  }

  private _loadInvoice(): void {
    if (!this.userId || !this.enrollmentId || !this.invoiceId) {
      return
    }

    this.paymentService.getInvoice(this.userId, this.enrollmentId, this.invoiceId).subscribe({
      next: (invoiceDetails: InvoiceDetails) => {
        this.invoiceDetails = invoiceDetails
      },
      error: ({error}) => {
        this.snackBarService.showError(error.message)
      }
    })
  }
}
