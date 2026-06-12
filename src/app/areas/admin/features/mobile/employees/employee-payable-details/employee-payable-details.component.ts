import { Component, HostBinding, Input, OnChanges, OnInit, SimpleChanges } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { TranslateService } from "@ngx-translate/core";
import { InvoiceAndPaymentsService } from "@core/services/invoiceAndPaymentsService";
import { SnackBarService } from "@core/services/snackBarService";
import { EmployeePayable, PayableLineItem } from "@core/types/invoices/employeePayable";
import { ButtonType } from "../../breadcrumb-nav-bar/breadcrumb-nav-bar.component";
import { PaymentStatus } from "@core/types/enums/paymentStatus";
import { Price } from "@core/types/price";
import { Weekday } from "@core/types/enums/weekday";

@Component({
  selector: "app-employee-payable-details",
  templateUrl: "./employee-payable-details.component.html",
  styleUrls: ["./employee-payable-details.component.scss"],
})
export class EmployeePayableDetailsComponent implements OnInit, OnChanges {
  @Input() @HostBinding('class.panel-view') panelView = false
  @Input() userId: string | null = null
  @Input() payableId: string | null = null

  readonly ButtonType = ButtonType;

  payable: EmployeePayable | null = null;

  constructor(
    private route: ActivatedRoute,
    private invoiceAndPaymentsService: InvoiceAndPaymentsService,
    private snackBarService: SnackBarService,
    private translate: TranslateService
  ) {}

  ngOnInit(): void {
    if (this.route.snapshot.data['panelView'] === true) {
      this.panelView = true
    }

    if (this.panelView && this.userId && this.payableId) {
      this._loadPayableDetails()
      return
    }

    if (!this.panelView) {
      this.userId = this.route.snapshot.paramMap.get("user-id");
      this.payableId = this.route.snapshot.paramMap.get("payable-id");
      this._loadPayableDetails()
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (
      this.panelView
      && (changes['userId'] || changes['payableId'])
      && this.userId
      && this.payableId
    ) {
      this._loadPayableDetails()
    }
  }

  getStatusClass(paymentStatus: PaymentStatus): string {
    switch (paymentStatus) {
      case PaymentStatus.PAID:
        return "paid-status";
      case PaymentStatus.ALMOST_DUE:
        return "almost-due-status";
      case PaymentStatus.OVERDUE:
        return "overdue-status";
      case PaymentStatus.PENDING:
        return "pending-status";
      default:
        return "";
    }
  }

  formatPrice(p: Price | null | undefined): string {
    if (!p || p.amount == null) return "0 MXN";
    return `${p.amount} ${p.currency ?? "MXN"}`;
  }

  trackByAssignmentId(_: number, item: PayableLineItem): string {
    return item.assignmentId;
  }

  /** "ClassType · Location · Mon/Wed/Fri · 8:00a.m." for display; max 2 lines. */
  formatClassLine(item: PayableLineItem): string {
    const parts: string[] = [];
    if (item.classType) {
      parts.push(this.translate.instant("CLASS_TYPES." + item.classType));
    }
    if (item.classLocation) parts.push(item.classLocation);
    if (item.days?.length) {
      const dayStrs = item.days.map((d) =>
        this.translate.instant("WEEKDAYS_SHORT." + (Weekday as Record<number, string>)[d])
      );
      parts.push(dayStrs.join("/"));
    }
    if (item.startTime) {
      const [hStr] = item.startTime.split(":");
      const h = parseInt(hStr, 10);
      const period = h >= 12 ? "p.m." : "a.m.";
      const displayHour = h % 12 || 12;
      parts.push(`${displayHour}:00${period}`);
    }
    return parts.join(" · ");
  }

  private _loadPayableDetails(): void {
    if (!this.userId || !this.payableId) return;

    this.invoiceAndPaymentsService.getPayableById(this.userId, this.payableId).subscribe({
      next: (p) => {
        this.payable = p;
      },
      error: (err) => {
        this.snackBarService.showError(err?.error?.message ?? "Error loading payable.");
      },
    });
  }
}
