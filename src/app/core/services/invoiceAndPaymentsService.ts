import { HttpClient } from "@angular/common/http"
import { Injectable } from "@angular/core";
import { Invoice } from "@core/types/invoices/invoice";
import { InvoiceDetails } from "@core/types/invoices/invoiceDetails";
import { InvoiceHistory } from "@core/types/invoices/invoiceHistory";
import { ApplyPaymentRequest } from "@core/types/invoices/applyPaymentRequest";
import { EmployeePayable } from "@core/types/invoices/employeePayable";
import { environment } from "environments/environment";
import { Observable, take, tap } from "rxjs";
import { CacheService } from "./cacheService";
import { CACHE_TTL } from "./cacheTtl";

export type InvoicesByUserIdResponse = {
  invoices: Invoice[];
  employeePayables: EmployeePayable[];
  userName: string;
};

@Injectable({
  providedIn: 'root'
})
export class InvoiceAndPaymentsService {
  private readonly _baseUrl = `${environment.apiUrl}/invoice-and-payments`

  constructor(
    private http: HttpClient,
    private cacheService: CacheService
  ) {}

  public getInvoiceHistory(userId: string, enrollmentId: string): Observable<InvoiceHistory> {
    return this.cacheService.get(
      `payments:history:${userId}:${enrollmentId}`,
      () => this.http.get<InvoiceHistory>(`${this._baseUrl}/${userId}/payments/${enrollmentId}`).pipe(take(1)),
      CACHE_TTL.MEDIUM
    );
  }

  public getInvoice(userId: string, enrollmentId: string, invoiceId: string): Observable<InvoiceDetails> {
    return this.cacheService.get(
      `payments:invoice:${userId}:${enrollmentId}:${invoiceId}`,
      () => this.http.get<InvoiceDetails>(`${this._baseUrl}/${userId}/payments/${enrollmentId}/${invoiceId}`).pipe(take(1)),
      CACHE_TTL.MEDIUM
    );
  }

  public applyPayment(
    userId: string,
    enrollmentId: string,
    invoiceId: string,
    request: ApplyPaymentRequest
  ): Observable<InvoiceDetails> {
    return this.http.post<InvoiceDetails>(
      `${this._baseUrl}/${userId}/payments/${enrollmentId}/${invoiceId}/apply`,
      request
    ).pipe(
      take(1),
      tap(() => this._invalidateUserPayments(userId, enrollmentId, invoiceId))
    );
  }

  public getInvoicesByUserId(userId: string): Observable<InvoicesByUserIdResponse> {
    return this.cacheService.get(
      `payments:user:${userId}:invoices`,
      () => this.http.get<InvoicesByUserIdResponse>(`${this._baseUrl}/${userId}/invoices`).pipe(take(1)),
      CACHE_TTL.MEDIUM
    );
  }

  public getPayableById(userId: string, payableId: string): Observable<EmployeePayable> {
    return this.cacheService.get(
      `payments:payable:${userId}:${payableId}`,
      () => this.http.get<EmployeePayable>(
        `${this._baseUrl}/${userId}/payables/${encodeURIComponent(payableId)}`
      ).pipe(take(1)),
      CACHE_TTL.MEDIUM
    );
  }

  private _invalidateUserPayments(userId: string, enrollmentId?: string, invoiceId?: string): void {
    this.cacheService.invalidate(`payments:user:${userId}:invoices`);
    this.cacheService.invalidatePattern(`payments:payable:${userId}:*`);

    if (enrollmentId) {
      this.cacheService.invalidate(`payments:history:${userId}:${enrollmentId}`);
      if (invoiceId) {
        this.cacheService.invalidate(`payments:invoice:${userId}:${enrollmentId}:${invoiceId}`);
      } else {
        this.cacheService.invalidatePattern(`payments:invoice:${userId}:${enrollmentId}:*`);
      }
    } else {
      this.cacheService.invalidatePattern(`payments:history:${userId}:*`);
      this.cacheService.invalidatePattern(`payments:invoice:${userId}:*`);
    }

    this.cacheService.invalidate(`enrollments:users:${userId}`);
    this.cacheService.invalidatePattern('classes:details:*');
  }
}
