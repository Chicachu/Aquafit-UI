import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { environment } from "environments/environment";
import { Observable, take } from "rxjs";

export enum CheckInType {
  CHECK_IN = "check-in",
  CHECK_OUT = "check-out"
}

export type EmployeeCheckIn = {
  _id: string;
  employeeId: string;
  type: CheckInType;
  date: string;
  assignmentId?: string | null;
  createdAt: string;
  updatedAt: string;
};

export type CreateCheckInRequest = {
  employeeId: string;
  type: CheckInType;
  date: string;
  assignmentId?: string | null;
};

@Injectable({
  providedIn: "root",
})
export class CheckInService {
  constructor(private http: HttpClient) {}

  createEntry(employeeId: string, type: CheckInType, date: Date, assignmentId?: string | null): Observable<EmployeeCheckIn> {
    return this.http
      .post<EmployeeCheckIn>(`${environment.apiUrl}/check-ins`, {
        employeeId,
        type,
        date: date.toISOString(),
        assignmentId: assignmentId || null,
      } as CreateCheckInRequest)
      .pipe(take(1));
  }

  getMyEntries(): Observable<EmployeeCheckIn[]> {
    return this.http
      .get<EmployeeCheckIn[]>(`${environment.apiUrl}/check-ins/my-entries`)
      .pipe(take(1));
  }
}
