import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable, take } from "rxjs";
import { environment } from "../../../environments/environment";

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
  constructor(private http: HttpClient) {}

  addWaitlistEntry(dto: CreateWaitlistEntryDTO): Observable<WaitlistEntry> {
    return this.http.post<WaitlistEntry>(`${environment.apiUrl}/waitlist`, dto).pipe(take(1));
  }

  getAllWaitlistEntries(): Observable<WaitlistEntry[]> {
    return this.http.get<WaitlistEntry[]>(`${environment.apiUrl}/waitlist`).pipe(take(1));
  }

  removeWaitlistEntry(waitlistId: string): Observable<void> {
    return this.http.delete<void>(`${environment.apiUrl}/waitlist`, { 
      body: { waitlistId } 
    }).pipe(take(1));
  }
}
