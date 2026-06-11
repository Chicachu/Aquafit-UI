import { HttpClient } from "@angular/common/http"
import { Injectable } from "@angular/core";
import { Invoice } from "@core/types/invoices/invoice";
import { InvoiceDetails } from "@core/types/invoices/invoiceDetails";
import { InvoiceHistory } from "@core/types/invoices/invoiceHistory";
import { ApplyPaymentRequest } from "@core/types/invoices/applyPaymentRequest";
import { EmployeePayable } from "@core/types/invoices/employeePayable";
import { environment } from "environments/environment";
import { Observable } from "rxjs";

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

  constructor(private http: HttpClient) {}

  public getInvoiceHistory(userId: string, enrollmentId: string): Observable<InvoiceHistory> {
    return this.http.get<InvoiceHistory>(`${this._baseUrl}/${userId}/payments/${enrollmentId}`)
  }

  public getInvoice(userId: string, enrollmentId: string, invoiceId: string): Observable<InvoiceDetails> {
    return this.http.get<InvoiceDetails>(`${this._baseUrl}/${userId}/payments/${enrollmentId}/${invoiceId}`)
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
    )
  }

  public getInvoicesByUserId(userId: string): Observable<InvoicesByUserIdResponse> {
    return this.http.get<InvoicesByUserIdResponse>(`${this._baseUrl}/${userId}/invoices`)
  }

  public getPayableById(userId: string, payableId: string): Observable<EmployeePayable> {
    return this.http.get<EmployeePayable>(
      `${this._baseUrl}/${userId}/payables/${encodeURIComponent(payableId)}`
    )
  }
}
