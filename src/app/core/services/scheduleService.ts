import { HttpClient, HttpParams } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable, map, tap } from "rxjs";
import { Class } from "../types/class";
import { environment } from "../../../environments/environment";
import { ScheduleView } from "../types/scheduleView";
import { CalendarClass } from "../types/calendarClass";

@Injectable({
  providedIn: 'root'
})
export class ScheduleService {
  constructor(private http: HttpClient) {}

  public getAllClasses(view: ScheduleView, date: Date): Observable<Map<string, CalendarClass[]>> {
    let params = new HttpParams()
    params = params.set('view', view)
    params = params.set('date', date.toISOString())
    
    let month, year 
    if (view === ScheduleView.MONTH) {
      year = date.getFullYear()
      month = date.getMonth()
      params = params.set('year', year).set('month', month)
    }
  
    return this.http.get<Map<string, CalendarClass[]>>(`${environment.apiUrl}/schedules/classes`, { params })
  }
}


