import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable, take } from "rxjs";
import { Class, CreateClassDTO } from "../types/class";
import { environment } from "../../../environments/environment";

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
}