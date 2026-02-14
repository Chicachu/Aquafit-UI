import { HttpClient, HttpParams } from "@angular/common/http"
import { Injectable } from "@angular/core"
import { Observable, take } from "rxjs"
import { environment } from "../../../environments/environment"
import { ScheduleView } from "../types/scheduleView"
import { CalendarClass } from "../types/calendarClass"
import { CacheService } from "./cacheService"

@Injectable({
  providedIn: 'root'
})
export class ScheduleService {
  constructor(
    private http: HttpClient,
    private cacheService: CacheService
  ) {}

  public getAllClasses(view: ScheduleView, date: Date, location: string): Observable<Map<string, CalendarClass[]>> {
    // Create cache key based on view, date, and location
    const dateKey = date.toISOString().split('T')[0]; // YYYY-MM-DD format
    const cacheKey = `schedule:${view}:${dateKey}:${location}`;
    
    // Check if this is today's date - don't cache today's schedule for real-time updates
    const today = new Date().toISOString().split('T')[0];
    const isToday = dateKey === today;
    const ttl = isToday ? 0 : 30 * 1000; // No cache for today, 30 seconds for other dates

    // If it's today, skip cache entirely
    if (isToday) {
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

    return this.cacheService.get(
      cacheKey,
      () => {
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
      },
      ttl
    );
  }
}


