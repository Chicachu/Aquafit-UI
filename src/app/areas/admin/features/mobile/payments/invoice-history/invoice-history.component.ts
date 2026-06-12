import { Component, HostBinding, Input, OnChanges, OnInit, SimpleChanges } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { InvoiceAndPaymentsService } from "@core/services/invoiceAndPaymentsService";
import { SnackBarService } from "@core/services/snackBarService";
import { ButtonType } from "../../breadcrumb-nav-bar/breadcrumb-nav-bar.component";
import { InvoiceHistory } from "@core/types/invoices/invoiceHistory";
import { PaymentStatus } from "@core/types/enums/paymentStatus";

@Component({
  selector: 'app-invoice-history',
  templateUrl: './invoice-history.component.html',
  styleUrls: ['./invoice-history.component.scss']
})
export class InvoiceHistoryComponent implements OnInit, OnChanges {
  @Input() @HostBinding('class.panel-view') panelView = false
  @Input() classId: string | null = null
  @Input() userId: string | null = null
  @Input() enrollmentId: string | null = null

  PaymentStatus = PaymentStatus
  ButtonType = ButtonType
  invoiceHistory: InvoiceHistory | null = null

  constructor(
    private _invoiceAndPaymentsService: InvoiceAndPaymentsService,
    private _route: ActivatedRoute,
    private _snackBarService: SnackBarService
  ) {}

  ngOnInit(): void {
    if (this._route.snapshot.data['panelView'] === true) {
      this.panelView = true
    }

    if (this.panelView && this.userId && this.enrollmentId) {
      this._loadInvoiceHistory()
      return
    }

    if (!this.panelView) {
      this.userId = this._route.snapshot.paramMap.get('user-id')
      this.enrollmentId = this._route.snapshot.paramMap.get('enrollment-id')
      this._loadInvoiceHistory()
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (
      this.panelView
      && (changes['userId'] || changes['enrollmentId'])
      && this.userId
      && this.enrollmentId
    ) {
      this._loadInvoiceHistory()
    }
  }

  getInvoiceDetailsLink(invoiceId: string): string[] {
    if (this.panelView && this.classId && this.userId && this.enrollmentId) {
      return [
        '/admin/classes',
        this.classId,
        'details',
        'invoice',
        this.userId,
        this.enrollmentId,
        invoiceId
      ]
    }

    if (this.panelView && this.userId && this.enrollmentId) {
      return [
        '/admin/clients',
        this.userId,
        'payments',
        this.enrollmentId,
        invoiceId
      ]
    }

    return [invoiceId]
  }

  public getIconClass(paymentStatus: PaymentStatus): string {
    switch (paymentStatus) {
      case PaymentStatus.PAID:
        return 'paid-status-icon'
      case PaymentStatus.ALMOST_DUE:
        return 'almost-due-status-icon'
      case PaymentStatus.OVERDUE:
        return 'overdue-status-icon'
      case PaymentStatus.PENDING:
        return ''
      default:
        return ''
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

  private _loadInvoiceHistory(): void {
    if (!this.userId || !this.enrollmentId) {
      return
    }

    this._invoiceAndPaymentsService.getInvoiceHistory(this.userId, this.enrollmentId).subscribe({
      next: (invoiceHistory: InvoiceHistory) => {
        this.invoiceHistory = invoiceHistory
      },
      error: ({ error }) => {
        this._snackBarService.showError(error.message)
      }
    })
  }
}
