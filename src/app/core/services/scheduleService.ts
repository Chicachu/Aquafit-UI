import { HttpClient, HttpParams } from "@angular/common/http"
import { Injectable } from "@angular/core"
import { Observable, take } from "rxjs"
import { environment } from "../../../environments/environment"
import { ScheduleView } from "../types/scheduleView"
import { CalendarClass } from "../types/calendarClass"

@Injectable({
  providedIn: 'root'
})
export class ScheduleService {
  constructor(private http: HttpClient) {}

  public getAllClasses(view: ScheduleView, date: Date, location: string): Observable<Map<string, CalendarClass[]>> {
    let params = new HttpParams()
    params = params.set('view', view)
    params = params.set('date', date.toISOString())
    params = params.set('location', location)
    
    let month, year 
    if (view === ScheduleView.MONTH) {
      year = date.getFullYear()
      month = date.getMonth()
      params = params.set('year', year).set('month', month)
    }
  
    return this.http.get<Map<string, CalendarClass[]>>(`${environment.apiUrl}/schedules/classes`, { params }).pipe(take(1))
  }
}


