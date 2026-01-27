import { Component } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { PaymentService } from "@core/services/paymentService";
import { SnackBarService } from "@core/services/snackBarService";
import { InvoiceDetails } from "@core/types/invoices/invoiceDetails";
import { ButtonType } from "../../breadcrumb-nav-bar/breadcrumb-nav-bar.component";
import { PaymentStatus } from "@core/types/enums/paymentStatus";

@Component({
  selector: 'app-invoice-details',
  templateUrl: './invoice-details.component.html',
  styleUrls: ['./invoice-details.component.scss']
})
export class InvoiceDetailsComponent {
  constructor(
    private _route: ActivatedRoute, 
    private _paymentService: PaymentService,
    private _snackBarService: SnackBarService
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
}