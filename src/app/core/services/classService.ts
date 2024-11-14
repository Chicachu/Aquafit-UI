import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { Class } from "../types/class";
import { environment } from "../../../environments/environment";

@Injectable({
  providedIn: 'root'
})
export class ClassService {
  constructor(private http: HttpClient) {}

  getAllClasses(): Observable<Class[]> {
    return this.http.get<Class[]>(`${environment.apiUrl}/classes`)
  }
}