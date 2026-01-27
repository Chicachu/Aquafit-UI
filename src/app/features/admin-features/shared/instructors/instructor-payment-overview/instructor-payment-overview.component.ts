import { Component } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { ButtonType } from "../../breadcrumb-nav-bar/breadcrumb-nav-bar.component";
import { PaymentService } from "@core/services/paymentService";
import { SnackBarService } from "@core/services/snackBarService";
import { PaymentStatus } from "@core/types/enums/paymentStatus";

export interface PaymentPeriodRow {
  date: Date;
  paymentStatus: PaymentStatus;
}

@Component({
  selector: 'app-instructor-payment-overview',
  templateUrl: './instructor-payment-overview.component.html',
  styleUrls: ['./instructor-payment-overview.component.scss']
})
export class InstructorPaymentOverviewComponent {
  readonly ButtonType = ButtonType;
  readonly PaymentStatus = PaymentStatus;

  userId: string | null = null;
  instructorName: string = '';
  periods: PaymentPeriodRow[] = [];

  constructor(
    private route: ActivatedRoute,
    private paymentService: PaymentService,
    private snackBarService: SnackBarService
  ) {}

  ngOnInit(): void {
    this.userId = this.route.snapshot.paramMap.get('user-id');
    if (!this.userId) return;

    this.paymentService.getInvoicesByUserId(this.userId).subscribe({
      next: ({ invoices, instructorPayables, userName }) => {
        this.instructorName = userName;
        const fromInvoices = invoices.map((i) => ({
          date: new Date(i.period.endDate),
          paymentStatus: i.paymentStatus
        }));
        const fromPayables = (instructorPayables || []).map((p) => ({
          date: new Date(p.period.endDate),
          paymentStatus: p.paymentStatus
        }));
        const combined = [...fromInvoices, ...fromPayables];
        combined.sort((a, b) => b.date.getTime() - a.date.getTime());
        this.periods = combined;
      },
      error: ({ error }) => {
        this.snackBarService.showError(error?.message ?? 'Error loading invoices.');
      }
    });
  }

  getIconClass(paymentStatus: PaymentStatus): string {
    switch (paymentStatus) {
      case PaymentStatus.PAID:
        return 'paid-status-icon';
      case PaymentStatus.ALMOST_DUE:
        return 'almost-due-status-icon';
      case PaymentStatus.OVERDUE:
        return 'overdue-status-icon';
      case PaymentStatus.PENDING:
        return '';
      default:
        return '';
    }
  }

  getStatusClass(paymentStatus: PaymentStatus): string {
    switch (paymentStatus) {
      case PaymentStatus.PAID:
        return 'paid-status';
      case PaymentStatus.ALMOST_DUE:
        return 'almost-due-status';
      case PaymentStatus.OVERDUE:
        return 'overdue-status';
      case PaymentStatus.PENDING:
        return 'pending-status';
      default:
        return '';
    }
  }

  isOverdue(paymentStatus: PaymentStatus): boolean {
    return paymentStatus === PaymentStatus.OVERDUE;
  }
}
