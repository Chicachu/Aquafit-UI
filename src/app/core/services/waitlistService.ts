import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable, take, tap } from "rxjs";
import { environment } from "../../../environments/environment";
import { CacheService } from "./cacheService";
import { CACHE_TTL } from "./cacheTtl";

export type WaitlistEntry = {
  _id: string;
  classId: string;
  userId: string;
  createdAt?: Date;
  updatedAt?: Date;
};

export type CreateWaitlistEntryDTO = {
  classId: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
};

@Injectable({
  providedIn: 'root'
})
export class WaitlistService {
  private readonly _allWaitlistKey = 'waitlist:all';

  constructor(
    private http: HttpClient,
    private cacheService: CacheService
  ) {}

  addWaitlistEntry(dto: CreateWaitlistEntryDTO): Observable<WaitlistEntry> {
    return this.http.post<WaitlistEntry>(`${environment.apiUrl}/waitlist`, dto).pipe(
      take(1),
      tap(() => this._invalidateWaitlistCaches())
    );
  }

  getAllWaitlistEntries(): Observable<WaitlistEntry[]> {
    return this.cacheService.get(
      this._allWaitlistKey,
      () => this.http.get<WaitlistEntry[]>(`${environment.apiUrl}/waitlist`).pipe(take(1)),
      CACHE_TTL.LONG
    );
  }

  removeWaitlistEntry(waitlistId: string): Observable<void> {
    return this.http.delete<void>(`${environment.apiUrl}/waitlist`, {
      body: { waitlistId }
    }).pipe(
      take(1),
      tap(() => this._invalidateWaitlistCaches())
    );
  }

  private _invalidateWaitlistCaches(): void {
    this.cacheService.invalidate(this._allWaitlistKey);
    this.cacheService.invalidatePattern('enrollments:users:*');
    this.cacheService.invalidatePattern('classes:details:*');
  }
}
