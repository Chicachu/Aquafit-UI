import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { BillingFrequency } from "@core/types/enums/billingFrequency";
import { environment } from "environments/environment";
import { Observable } from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class EnrollmentService {
  constructor(private http: HttpClient) {}

  enrollClient(classId: string, clientId: string, startDate: Date, billingFrequency: BillingFrequency): Observable<void> {
    return this.http.post<void>(`${environment.apiUrl}/enrollments/`, { classId, clientId, startDate, billingFrequency })
  }
}