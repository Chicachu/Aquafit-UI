import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { environment } from "environments/environment";
import { Observable, take } from "rxjs";
import { Assignment, AssignmentCreationDTO } from "@core/types/assignment";

@Injectable({
  providedIn: 'root'
})
export class AssignmentService {
  constructor(private http: HttpClient) {}

  assignInstructor(classId: string, instructorId: string, startDate: Date, endDate?: Date | null): Observable<Assignment> {
    return this.http.post<Assignment>(`${environment.apiUrl}/assignments/`, {
      classId,
      instructorId,
      startDate,
      endDate
    }).pipe(take(1))
  }

  updateAssignment(assignmentId: string, opts: { endDate?: Date | null }): Observable<Assignment> {
    const body: { endDate?: string | null } = {}
    if (opts.endDate != null) body.endDate = (opts.endDate instanceof Date ? opts.endDate : new Date(opts.endDate)).toISOString()
    else if (opts.endDate === null) body.endDate = null
    return this.http.patch<Assignment>(`${environment.apiUrl}/assignments/${assignmentId}`, body).pipe(take(1))
  }

  unassignInstructor(assignmentId: string): Observable<void> {
    return this.http.delete<void>(`${environment.apiUrl}/assignments/${assignmentId}`).pipe(take(1))
  }
}
