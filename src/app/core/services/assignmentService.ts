import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { environment } from "environments/environment";
import { Observable, take, tap } from "rxjs";
import { map } from "rxjs/operators";
import { Assignment } from "@core/types/assignment";
import { Price } from "@core/types/price";
import { CacheService } from "./cacheService";
import { CACHE_TTL } from "./cacheTtl";

@Injectable({
  providedIn: 'root'
})
export class AssignmentService {
  private readonly _activeClassIdsKey = 'assignments:classIdsActive';

  constructor(
    private http: HttpClient,
    private cacheService: CacheService
  ) {}

  /** Class IDs that have at least one active assignment (any instructor). */
  getClassIdsWithActiveAssignments(): Observable<string[]> {
    return this.cacheService.get(
      this._activeClassIdsKey,
      () => this.http
        .get<{ classIds: string[] }>(`${environment.apiUrl}/assignments/class-ids-with-active`)
        .pipe(take(1), map((res) => res.classIds)),
      CACHE_TTL.SHORT
    );
  }

  assignInstructor(classId: string, employeeId: string, startDate: Date, endDate?: Date | null): Observable<Assignment> {
    return this.http.post<Assignment>(`${environment.apiUrl}/assignments/`, {
      classId,
      employeeId,
      startDate,
      endDate
    }).pipe(
      take(1),
      tap(() => this._invalidateAfterAssignmentChange())
    );
  }

  updateAssignment(assignmentId: string, opts: { endDate?: Date | null; paymentValue?: Price | null }): Observable<Assignment> {
    const body: { endDate?: string | null; paymentValue?: { amount: number; currency: string } | null } = {}
    if (opts.endDate != null) body.endDate = (opts.endDate instanceof Date ? opts.endDate : new Date(opts.endDate)).toISOString()
    else if (opts.endDate === null) body.endDate = null
    if (opts.paymentValue !== undefined) {
      body.paymentValue = opts.paymentValue
        ? { amount: opts.paymentValue.amount, currency: opts.paymentValue.currency }
        : null
    }
    return this.http.patch<Assignment>(`${environment.apiUrl}/assignments/${assignmentId}`, body).pipe(
      take(1),
      tap(() => this._invalidateAfterAssignmentChange())
    );
  }

  unassignInstructor(assignmentId: string): Observable<void> {
    return this.http.delete<void>(`${environment.apiUrl}/assignments/${assignmentId}`).pipe(
      take(1),
      tap(() => this._invalidateAfterAssignmentChange())
    );
  }

  private _invalidateAfterAssignmentChange(): void {
    this.cacheService.invalidate(this._activeClassIdsKey);
    this.cacheService.invalidatePattern('schedules:users:*');
    this.cacheService.invalidatePattern('classes:details:*');
    this.cacheService.invalidatePattern('classes:*');
    this.cacheService.invalidate('classes:all');
    this.cacheService.invalidate('classes:scheduleMap');
    this.cacheService.invalidatePattern('schedule:*');
  }
}
