import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { BillingFrequency } from "@core/types/enums/billingFrequency";
import { environment } from "environments/environment";
import { Observable, take } from "rxjs";
import { Enrollment } from "@core/types/enrollment";

@Injectable({
  providedIn: 'root'
})
export class EnrollmentService {
  constructor(private http: HttpClient) {}

  enrollClient(classId: string, clientId: string, startDate: Date, billingFrequency: BillingFrequency, daysOverride: number[]): Observable<void> {
    return this.http.post<void>(`${environment.apiUrl}/enrollments/`, { classId, clientId, startDate, billingFrequency, daysOverride })
  }

  getAllActiveEnrollments(): Observable<Enrollment[]> {
    return this.http.get<Enrollment[]>(`${environment.apiUrl}/enrollments/active`).pipe(take(1))
  }

  unenrollClient(enrollmentId: string, cancelReason?: string): Observable<Enrollment> {
    return this.http.post<Enrollment>(`${environment.apiUrl}/enrollments/unenroll`, {
      enrollmentId,
      cancelReason
    }).pipe(take(1))
  }
}