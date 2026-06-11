import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { BillingFrequency } from "@core/types/enums/billingFrequency";
import { environment } from "environments/environment";
import { Observable, take, tap } from "rxjs";
import { Enrollment } from "@core/types/enrollment";
import { ClientEnrollmentDetails } from "@core/types/clients/clientEnrollmentDetails";
import { CacheService } from "./cacheService";

@Injectable({
  providedIn: 'root'
})
export class EnrollmentService {
  constructor(
    private http: HttpClient,
    private cacheService: CacheService
  ) {}

  enrollClient(classId: string, clientId: string, startDate: Date, billingFrequency: BillingFrequency, daysOverride: number[]): Observable<void> {
    return this.http.post<void>(`${environment.apiUrl}/enrollments/`, { classId, clientId, startDate, billingFrequency, daysOverride }).pipe(
      take(1),
      tap(() => this.cacheService.invalidate(this._clientEnrollmentCacheKey(clientId)))
    )
  }

  getAllActiveEnrollments(): Observable<Enrollment[]> {
    return this.http.get<Enrollment[]>(`${environment.apiUrl}/enrollments/active`).pipe(take(1))
  }

  getClientEnrollmentDetails(userId: string): Observable<ClientEnrollmentDetails> {
    return this.cacheService.get(
      this._clientEnrollmentCacheKey(userId),
      () => this.http.get<ClientEnrollmentDetails>(`${environment.apiUrl}/enrollments/users/${userId}`).pipe(take(1)),
      1 * 60 * 1000
    );
  }

  unenrollClient(enrollmentId: string, cancelReason?: string, clientId?: string): Observable<Enrollment> {
    return this.http.post<Enrollment>(`${environment.apiUrl}/enrollments/unenroll`, {
      enrollmentId,
      cancelReason
    }).pipe(
      take(1),
      tap(() => {
        if (clientId) {
          this.cacheService.invalidate(this._clientEnrollmentCacheKey(clientId))
        }
      })
    )
  }

  private _clientEnrollmentCacheKey(userId: string): string {
    return `enrollments:users:${userId}`
  }
}
