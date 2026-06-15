import { Component, HostBinding, Input, OnChanges, OnInit, SimpleChanges } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { ActivatedRoute } from "@angular/router";
import { InvoiceAndPaymentsService } from "@core/services/invoiceAndPaymentsService";
import { SnackBarService } from "@core/services/snackBarService";
import { InvoiceDetails } from "@core/types/invoices/invoiceDetails";
import { ButtonType } from "../../breadcrumb-nav-bar/breadcrumb-nav-bar.component";
import { PaymentStatus } from "@core/types/enums/paymentStatus";
import { getPaymentStatusTranslationKey } from "@shared/utils/paymentStatusUtils";
import { PaymentType } from "@core/types/enums/paymentType";
import { TextInputType } from "@core/types/enums/textInputType";
import { SelectOption } from "@core/types/selectOption";
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
  PaymentStatus = PaymentStatus
  getPaymentStatusTranslationKey = getPaymentStatusTranslationKey
  readonly TextInputType = TextInputType
  invoiceDetails: InvoiceDetails | null = null

  showApplyPaymentModal = false
  applyingPayment = false
  paymentForm: FormGroup
  paymentModalButtons = [
    { text: 'CONTROLS.CANCEL' },
    { text: 'PAYMENTS.APPLY_PAYMENT' }
  ]
  paymentTypeOptions: SelectOption[] = [
    { value: PaymentType.CASH, viewValue: 'CASH' },
    { value: PaymentType.TRANSFER, viewValue: 'TRANSFER' }
  ]

  get remainingBalance(): number {
    if (!this.invoiceDetails) {
      return 0
    }

    if (this.invoiceDetails.remainingBalance != null) {
      return Math.max(0, this.invoiceDetails.remainingBalance)
    }

    const totalPaid = (this.invoiceDetails.paymentsApplied || []).reduce(
      (sum, payment) => sum + (payment.charge?.amount ?? 0),
      0
    )

    return Math.max(0, this.invoiceDetails.charge.amount - totalPaid)
  }

  get canApplyPayment(): boolean {
    if (!this.invoiceDetails?.paymentStatus) {
      return false
    }

    return this.invoiceDetails.paymentStatus !== PaymentStatus.PAID
      && this.invoiceDetails.paymentStatus !== PaymentStatus.CANCELLED
      && this.remainingBalance > 0
  }

  get enteredPaymentAmount(): number {
    const raw = this.paymentForm.get('amount')?.value
    const amount = typeof raw === 'string' ? parseFloat(raw) : Number(raw)
    return isNaN(amount) ? 0 : amount
  }

  get changeDue(): number {
    if (this.enteredPaymentAmount <= this.remainingBalance) {
      return 0
    }

    return this.enteredPaymentAmount - this.remainingBalance
  }

  get currency(): string {
    return this.invoiceDetails?.charge.currency ?? 'MXN'
  }

  constructor(
    private route: ActivatedRoute,
    private invoiceAndPaymentsService: InvoiceAndPaymentsService,
    private snackBarService: SnackBarService,
    private translateService: TranslateService,
    private fb: FormBuilder
  ) {
    this.paymentForm = this.fb.group({
      paymentType: [PaymentType.CASH, Validators.required],
      amount: ['', [Validators.required, Validators.min(0)]]
    })
  }

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

  getPaymentTenderedAmount(payment: InvoiceDetails['paymentsApplied'][number]): number {
    return payment.amountTendered?.amount ?? payment.charge.amount
  }

  getPaymentTypeLabel(paymentType: PaymentType): string {
    return this.translateService.instant(`PAYMENT_TYPE.${paymentType.toUpperCase()}`)
  }

  getPaymentChangeDue(payment: InvoiceDetails['paymentsApplied'][number]): number | null {
    if (payment.changeDue?.amount != null && payment.changeDue.amount > 0) {
      return payment.changeDue.amount
    }

    return null
  }

  applyPayment(): void {
    if (!this.canApplyPayment) {
      return
    }

    this.paymentForm.reset({
      paymentType: PaymentType.CASH,
      amount: ''
    })
    this.showApplyPaymentModal = true
  }

  processApplyPaymentModalClick(event: { buttonTitle: string }): void {
    if (event.buttonTitle === 'CONTROLS.CANCEL' || event.buttonTitle === 'close-button') {
      this._closeApplyPaymentModal()
      return
    }

    if (event.buttonTitle !== 'PAYMENTS.APPLY_PAYMENT' || this.applyingPayment) {
      return
    }

    if (!this.userId || !this.enrollmentId || !this.invoiceId) {
      return
    }

    const rawAmount = this.paymentForm.get('amount')?.value
    const amount = typeof rawAmount === 'string' ? parseFloat(rawAmount) : Number(rawAmount)
    const paymentType = this.paymentForm.get('paymentType')?.value as PaymentType

    if (isNaN(amount) || amount <= 0) {
      this.snackBarService.showError(this.translateService.instant('PAYMENTS.INVALID_AMOUNT'))
      return
    }

    if (!paymentType) {
      this.snackBarService.showError(this.translateService.instant('PAYMENTS.PAYMENT_TYPE_REQUIRED'))
      return
    }

    this.applyingPayment = true

    this.invoiceAndPaymentsService.applyPayment(this.userId, this.enrollmentId, this.invoiceId, {
      amount,
      paymentType
    }).subscribe({
      next: (invoiceDetails: InvoiceDetails) => {
        this.invoiceDetails = invoiceDetails
        this.snackBarService.showSuccess(this.translateService.instant('PAYMENTS.APPLY_PAYMENT_SUCCESS'))
        this._closeApplyPaymentModal()
        this.applyingPayment = false
      },
      error: ({ error }) => {
        this.snackBarService.showError(error?.message || this.translateService.instant('PAYMENTS.APPLY_PAYMENT_ERROR'))
        this.applyingPayment = false
      }
    })
  }

  private _closeApplyPaymentModal(): void {
    this.showApplyPaymentModal = false
    this.paymentForm.reset({
      paymentType: PaymentType.CASH,
      amount: ''
    })
  }

  private _loadInvoice(): void {
    if (!this.userId || !this.enrollmentId || !this.invoiceId) {
      return
    }

    this.invoiceAndPaymentsService.getInvoice(this.userId, this.enrollmentId, this.invoiceId).subscribe({
      next: (invoiceDetails: InvoiceDetails) => {
        this.invoiceDetails = invoiceDetails
      },
      error: ({error}) => {
        this.snackBarService.showError(error.message)
      }
    })
  }
}
