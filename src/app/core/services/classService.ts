import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable, take, tap } from "rxjs";
import { Class, CreateClassDTO } from "../types/classes/class";
import { environment } from "../../../environments/environment";
import { ClassDetails } from "../types/classes/classDetails";
import { ClassScheduleMap } from "@core/types/classScheduleMap";
import { CacheService } from "./cacheService";

@Injectable({
  providedIn: 'root'
})
export class ClassService {
  constructor(
    private http: HttpClient,
    private cacheService: CacheService
  ) {}

  getAllClasses(): Observable<Class[]> {
    return this.cacheService.get(
      'classes:all',
      () => this.http.get<Class[]>(`${environment.apiUrl}/classes`).pipe(take(1)),
      2 * 60 * 1000 // 2 minutes TTL
    );
  }

  getAllLocations(): Observable<string[]> {
    return this.cacheService.get(
      'classes:locations',
      () => this.http.get<string[]>(`${environment.apiUrl}/classes/locations`).pipe(take(1)),
      5 * 60 * 1000 // 5 minutes TTL - locations rarely change
    );
  }

  createNewClass(newClass: CreateClassDTO): Observable<void> {
    return this.http.put<void>(`${environment.apiUrl}/classes`, { newClass }).pipe(
      take(1),
      tap(() => {
        // Invalidate caches that might be affected
        this.cacheService.invalidate('classes:all');
        this.cacheService.invalidate('classes:locations');
        this.cacheService.invalidate('classes:scheduleMap');
        this.cacheService.invalidatePattern('schedule:*');
      })
    );
  }

  getClassDetails(classId: string): Observable<ClassDetails> {
    return this.cacheService.get(
      `classes:details:${classId}`,
      () => this.http.get<ClassDetails>(`${environment.apiUrl}/classes/${classId}/details`).pipe(take(1)),
      1 * 60 * 1000 // 1 minute TTL
    );
  }

  getClassScheduleMap(): Observable<ClassScheduleMap> {
    return this.cacheService.get(
      'classes:scheduleMap',
      () => this.http.get<ClassScheduleMap>(`${environment.apiUrl}/classes/classScheduleMap`).pipe(take(1)),
      2 * 60 * 1000 // 2 minutes TTL
    );
  }

  getClass(classId: string): Observable<Class> {
    return this.cacheService.get(
      `classes:${classId}`,
      () => this.http.get<Class>(`${environment.apiUrl}/classes/${classId}`).pipe(take(1)),
      1 * 60 * 1000 // 1 minute TTL
    );
  }

  updateClass(classId: string, classData: CreateClassDTO): Observable<void> {
    return this.http.put<void>(`${environment.apiUrl}/classes/${classId}`, { newClass: classData }).pipe(
      take(1),
      tap(() => {
        // Invalidate caches for this specific class and related data
        this.cacheService.invalidate(`classes:${classId}`);
        this.cacheService.invalidate(`classes:details:${classId}`);
        this.cacheService.invalidate('classes:all');
        this.cacheService.invalidate('classes:scheduleMap');
        this.cacheService.invalidatePattern('schedule:*');
      })
    );
  }

  terminateClass(classId: string, endDate: Date): Observable<void> {
    return this.http.post<void>(`${environment.apiUrl}/classes/${classId}/terminate`, { endDate }).pipe(
      take(1),
      tap(() => {
        this.cacheService.invalidate(`classes:${classId}`);
        this.cacheService.invalidate(`classes:details:${classId}`);
        this.cacheService.invalidate('classes:all');
        this.cacheService.invalidate('classes:scheduleMap');
        this.cacheService.invalidatePattern('schedule:*');
      })
    );
  }

  cancelClass(classId: string, cancellationDate: Date, cancelledBy?: 'instructor' | 'client', reason?: string): Observable<void> {
    const body: { cancellationDate: Date; cancelledBy?: 'instructor' | 'client'; reason?: string } = { cancellationDate }
    if (cancelledBy) {
      body.cancelledBy = cancelledBy
    }
    if (reason != null && reason.trim()) {
      body.reason = reason.trim()
    }
    return this.http.post<void>(`${environment.apiUrl}/classes/${classId}/cancel`, body).pipe(
      take(1),
      tap(() => {
        this.cacheService.invalidate(`classes:${classId}`);
        this.cacheService.invalidate(`classes:details:${classId}`);
        this.cacheService.invalidate('classes:all');
        this.cacheService.invalidate('classes:scheduleMap');
        this.cacheService.invalidatePattern('schedule:*');
      })
    );
  }

  addNote(classId: string, content: string): Observable<Class> {
    return this.http.post<Class>(`${environment.apiUrl}/classes/${classId}/notes`, { content }).pipe(
      take(1),
      tap(() => {
        // Notes affect class details
        this.cacheService.invalidate(`classes:${classId}`);
        this.cacheService.invalidate(`classes:details:${classId}`);
      })
    );
  }

  deleteNote(classId: string, noteId: string): Observable<Class> {
    return this.http.delete<Class>(`${environment.apiUrl}/classes/${classId}/notes/${noteId}`).pipe(
      take(1),
      tap(() => {
        this.cacheService.invalidate(`classes:${classId}`);
        this.cacheService.invalidate(`classes:details:${classId}`);
      })
    );
  }
}