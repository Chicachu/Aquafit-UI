import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable, take } from "rxjs";
import { Class, CreateClassDTO } from "../types/classes/class";
import { environment } from "../../../environments/environment";
import { ClassDetails } from "../types/classes/classDetails";
import { ClassScheduleMap } from "@core/types/classScheduleMap";

@Injectable({
  providedIn: 'root'
})
export class ClassService {
  constructor(private http: HttpClient) {}

  getAllClasses(): Observable<Class[]> {
    return this.http.get<Class[]>(`${environment.apiUrl}/classes`).pipe(take(1))
  }

  getAllLocations(): Observable<string[]> {
    return this.http.get<string[]>(`${environment.apiUrl}/classes/locations`).pipe(take(1))
  }

  createNewClass(newClass: CreateClassDTO): Observable<void> {
    return this.http.put<void>(`${environment.apiUrl}/classes`, { newClass }).pipe(take(1))
  }

  getClassDetails(classId: string): Observable<ClassDetails> {
    return this.http.get<ClassDetails>(`${environment.apiUrl}/classes/${classId}/details`).pipe(take(1))
  }

  getClassScheduleMap(): Observable<ClassScheduleMap> {
    return this.http.get<ClassScheduleMap>(`${environment.apiUrl}/classes/classScheduleMap`).pipe(take(1))
  }

  getClass(classId: string): Observable<Class> {
    return this.http.get<Class>(`${environment.apiUrl}/classes/${classId}`).pipe(take(1))
  }

  updateClass(classId: string, classData: CreateClassDTO): Observable<void> {
    return this.http.put<void>(`${environment.apiUrl}/classes/${classId}`, { newClass: classData }).pipe(take(1))
  }

  terminateClass(classId: string, endDate: Date): Observable<void> {
    return this.http.post<void>(`${environment.apiUrl}/classes/${classId}/terminate`, { endDate }).pipe(take(1))
  }

  cancelClass(classId: string, cancellationDate: Date): Observable<void> {
    return this.http.post<void>(`${environment.apiUrl}/classes/${classId}/cancel`, { cancellationDate }).pipe(take(1))
  }
}