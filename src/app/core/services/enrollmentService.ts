import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { BillingFrequency } from "@core/types/enums/billingFrequency";
import { environment } from "environments/environment";
import { Observable, take, tap } from "rxjs";
import { Enrollment } from "@core/types/enrollment";
import { ClientEnrollmentDetails } from "@core/types/clients/clientEnrollmentDetails";
import { CacheService } from "./cacheService";
import { CACHE_TTL } from "./cacheTtl";

@Injectable({
  providedIn: 'root'
})
export class EnrollmentService {
  private readonly _activeEnrollmentsKey = 'enrollments:active';

  constructor(
    private http: HttpClient,
    private cacheService: CacheService
  ) {}

  enrollClient(
    classId: string,
    clientId: string,
    startDate: Date,
    billingFrequency?: BillingFrequency | null,
    daysOverride?: number[] | null
  ): Observable<void> {
    const body: {
      classId: string
      clientId: string
      startDate: Date
      billingFrequency?: BillingFrequency
      daysOverride?: number[] | null
    } = { classId, clientId, startDate, daysOverride: daysOverride ?? null }

    if (billingFrequency) {
      body.billingFrequency = billingFrequency
    }

    return this.http.post<void>(`${environment.apiUrl}/enrollments/`, body).pipe(
      take(1),
      tap(() => this._invalidateEnrollmentCaches(clientId, classId))
    )
  }

  getAllActiveEnrollments(): Observable<Enrollment[]> {
    return this.cacheService.get(
      this._activeEnrollmentsKey,
      () => this.http.get<Enrollment[]>(`${environment.apiUrl}/enrollments/active`).pipe(take(1)),
      CACHE_TTL.LONG
    );
  }

  getClientEnrollmentDetails(userId: string): Observable<ClientEnrollmentDetails> {
    return this.cacheService.get(
      this._clientEnrollmentCacheKey(userId),
      () => this.http.get<ClientEnrollmentDetails>(`${environment.apiUrl}/enrollments/users/${userId}`).pipe(take(1)),
      CACHE_TTL.MEDIUM
    );
  }

  unenrollClient(enrollmentId: string, cancelReason?: string, clientId?: string, classId?: string): Observable<Enrollment> {
    return this.http.post<Enrollment>(`${environment.apiUrl}/enrollments/unenroll`, {
      enrollmentId,
      cancelReason
    }).pipe(
      take(1),
      tap(() => this._invalidateEnrollmentCaches(clientId, classId))
    )
  }

  private _clientEnrollmentCacheKey(userId: string): string {
    return `enrollments:users:${userId}`
  }

  private _invalidateEnrollmentCaches(clientId?: string, classId?: string): void {
    this.cacheService.invalidate(this._activeEnrollmentsKey);

    if (clientId) {
      this.cacheService.invalidate(this._clientEnrollmentCacheKey(clientId));
      this.cacheService.invalidate(`users:${clientId}:can-delete`);
      this.cacheService.invalidate(`payments:user:${clientId}:invoices`);
      this.cacheService.invalidatePattern(`payments:history:${clientId}:*`);
      this.cacheService.invalidatePattern(`payments:invoice:${clientId}:*`);
      this.cacheService.invalidatePattern(`payments:payable:${clientId}:*`);
    }

    if (classId) {
      this.cacheService.invalidate(`classes:details:${classId}`);
      this.cacheService.invalidate(`classes:${classId}`);
    } else if (clientId) {
      this.cacheService.invalidatePattern('classes:details:*');
    }

    this.cacheService.invalidatePattern('schedule:*');
  }
}
