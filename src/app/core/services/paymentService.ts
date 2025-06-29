import { HttpClient } from "@angular/common/http"
import { Injectable } from "@angular/core";
import { Invoice } from "@core/types/invoices/invoice";
import { InvoiceDetails } from "@core/types/invoices/invoiceDetails";
import { InvoiceHistory } from "@core/types/invoices/invoiceHistory";
import { environment } from "environments/environment";
import { Observable } from "rxjs";

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
}
