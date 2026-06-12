import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { environment } from "environments/environment";
import { Observable, take, tap } from "rxjs";
import { CacheService } from "./cacheService";
import { CACHE_TTL } from "./cacheTtl";

export enum CheckInType {
  CHECK_IN = "check-in",
  CHECK_OUT = "check-out"
}

export type EmployeeCheckIn = {
  _id: string;
  employeeId: string;
  type: CheckInType;
  date: string;
  createdAt: string;
  updatedAt: string;
};

export type CreateCheckInRequest = {
  employeeId: string;
  type: CheckInType;
  date: string;
};

@Injectable({
  providedIn: "root",
})
export class CheckInService {
  constructor(
    private http: HttpClient,
    private cacheService: CacheService
  ) {}

  createEntry(employeeId: string, type: CheckInType, date: Date): Observable<EmployeeCheckIn> {
    const eid = employeeId == null ? "" : String(employeeId).trim();
    const body: CreateCheckInRequest = {
      employeeId: eid,
      type,
      date: date.toISOString(),
    };
    return this.http
      .post<EmployeeCheckIn>(`${environment.apiUrl}/check-ins`, body)
      .pipe(
        take(1),
        tap(() => this._invalidateEmployeeEntries(eid))
      );
  }

  getMyEntries(): Observable<EmployeeCheckIn[]> {
    return this.cacheService.get(
      'checkins:my-entries',
      () => this.http
        .get<EmployeeCheckIn[]>(`${environment.apiUrl}/check-ins/my-entries`)
        .pipe(take(1)),
      CACHE_TTL.SHORT
    );
  }

  getEntriesByEmployeeId(employeeId: string): Observable<EmployeeCheckIn[]> {
    const id = employeeId == null ? "" : String(employeeId).trim();
    return this.cacheService.get(
      `checkins:entries:${id}`,
      () => this.http
        .get<EmployeeCheckIn[]>(`${environment.apiUrl}/check-ins/entries/${encodeURIComponent(id)}`)
        .pipe(take(1)),
      CACHE_TTL.SHORT
    );
  }

  private _invalidateEmployeeEntries(employeeId: string): void {
    this.cacheService.invalidate('checkins:my-entries');
    if (employeeId) {
      this.cacheService.invalidate(`checkins:entries:${employeeId}`);
    }
    this.cacheService.invalidatePattern('payments:*');
  }
}
