import { Component } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { PaymentService } from "@core/services/paymentService";
import { SnackBarService } from "@core/services/snackBarService";
import { ButtonType } from "../../breadcrumb-nav-bar/breadcrumb-nav-bar.component";
import { InvoiceHistory } from "@core/types/invoices/invoiceHistory";
import { PaymentStatus } from "@core/types/enums/paymentStatus";

@Component({
  selector: 'app-payment-history',
  templateUrl: './payment-history.component.html',
  styleUrls: ['./payment-history.component.scss']
})
export class PaymentHistoryComponent {
  // component for showing payment history for a specific enrollment 
  constructor(
    private _paymentService: PaymentService, 
    private _route: ActivatedRoute,
    private _snackBarService: SnackBarService
  ) {}
  PaymentStatus = PaymentStatus
  ButtonType = ButtonType
  userId: string | null = null
  enrollmentId: string | null = null
  invoiceHistory: InvoiceHistory | null = null

  ngOnInit(): void {
    this.userId = this._route.snapshot.paramMap.get('user-id')
    this.enrollmentId = this._route.snapshot.paramMap.get('enrollment-id')
    
    if (this.userId && this.enrollmentId) {
      this._paymentService.getInvoiceHistory(this.userId, this.enrollmentId).subscribe({
        next: (invoiceHistory: InvoiceHistory) => {
          this.invoiceHistory = invoiceHistory
        },
        error: ({error}) => {
          this._snackBarService.showError(error.message)
        }
      })
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
}