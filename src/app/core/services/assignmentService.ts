import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { environment } from "environments/environment";
import { Observable, take } from "rxjs";
import { map } from "rxjs/operators";
import { Assignment, AssignmentCreationDTO } from "@core/types/assignment";
import { Price } from "@core/types/price";

@Injectable({
  providedIn: 'root'
})
export class AssignmentService {
  constructor(private http: HttpClient) {}

  /** Class IDs that have at least one active assignment (any instructor). Used to hide them from the Assign Instructor modal. */
  getClassIdsWithActiveAssignments(): Observable<string[]> {
    return this.http
      .get<{ classIds: string[] }>(`${environment.apiUrl}/assignments/class-ids-with-active`)
      .pipe(take(1), map((res) => res.classIds))
  }

  assignInstructor(classId: string, employeeId: string, startDate: Date, endDate?: Date | null): Observable<Assignment> {
    return this.http.post<Assignment>(`${environment.apiUrl}/assignments/`, {
      classId,
      employeeId,
      startDate,
      endDate
    }).pipe(take(1))
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
    return this.http.patch<Assignment>(`${environment.apiUrl}/assignments/${assignmentId}`, body).pipe(take(1))
  }

  unassignInstructor(assignmentId: string): Observable<void> {
    return this.http.delete<void>(`${environment.apiUrl}/assignments/${assignmentId}`).pipe(take(1))
  }
}
