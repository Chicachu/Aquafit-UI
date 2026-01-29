import { HttpClient } from "@angular/common/http"
import { Injectable } from "@angular/core";
import { Invoice } from "@core/types/invoices/invoice";
import { InvoiceDetails } from "@core/types/invoices/invoiceDetails";
import { InvoiceHistory } from "@core/types/invoices/invoiceHistory";
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
export class PaymentService {
  constructor(private http: HttpClient) {}

  public getInvoiceHistory(userId: string, enrollmentId: string): Observable<InvoiceHistory> {
    return this.http.get<InvoiceHistory>(`${environment.apiUrl}/users/${userId}/payments/${enrollmentId}`)
  }

  public getInvoice(userId: string, enrollmentId: string, invoiceId: string): Observable<InvoiceDetails> {
    return this.http.get<InvoiceDetails>(`${environment.apiUrl}/users/${userId}/payments/${enrollmentId}/${invoiceId}`)
  }

  public getInvoicesByUserId(userId: string): Observable<InvoicesByUserIdResponse> {
    return this.http.get<InvoicesByUserIdResponse>(`${environment.apiUrl}/users/${userId}/invoices`)
  }

  public getPayableById(userId: string, payableId: string): Observable<EmployeePayable> {
    return this.http.get<EmployeePayable>(
      `${environment.apiUrl}/users/${userId}/payables/${encodeURIComponent(payableId)}`
    )
  }
}
