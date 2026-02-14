import { Injectable } from "@angular/core"
import { Role } from "../types/enums/role"
import { User } from "../types/user"
import { HttpClient } from "@angular/common/http"
import { Observable, take, tap } from "rxjs"
import { map } from "rxjs/operators"
import { environment } from "../../../environments/environment"
import { ClientEnrollmentDetails } from "@core/types/clients/clientEnrollmentDetails"
import { EmployeeClassDetails } from "@core/types/employees/employeeClassDetails"
import { CacheService } from "./cacheService"

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private _user: User | null = null

  constructor(
    private _http: HttpClient,
    private cacheService: CacheService
  ) { }

  set user(user: User) {
    this._user = {...user}
    sessionStorage.setItem('user', JSON.stringify(this._user))
  }

  get user(): User | null {
    this._checkSessionStorage()
    return this._user
  }

  get isUserLoggedIn(): boolean {
    this._checkSessionStorage()
    return !!this._user
  }

  get userRole(): Role | undefined {
    this._checkSessionStorage()
    return this._user?.role
  }

  get isAdmin(): boolean { 
    this._checkSessionStorage()
    return this._user?.role === Role.ADMIN
  }

  private _checkSessionStorage() {
    if (!this._user) {
      try {
        const raw = sessionStorage.getItem('user')
        const parsed = raw ? JSON.parse(raw) : null
        this._user = parsed && typeof parsed === 'object' && parsed._id && parsed.accessToken ? parsed : null
        if (!this._user && raw) sessionStorage.removeItem('user')
      } catch {
        this._user = null
        sessionStorage.removeItem('user')
      }
    }
  }

  clearSession(): void {
    this._user = null
    sessionStorage.removeItem('user')
  }

  register(username: string, password: string, role: Role): Observable<User> {
    return this._http.post<User>(`${environment.apiUrl}/users/register`, { username, password, role }).pipe(take(1))
  }

  getAllUsers(role?: Role): Observable<User[]> {
    const cacheKey = role ? `users:all:${role}` : 'users:all';
    return this.cacheService.get(
      cacheKey,
      () => this._http.get<User[]>(`${environment.apiUrl}/users?role=${role}`).pipe(take(1)),
      2 * 60 * 1000 // 2 minutes TTL
    );
  }

  getUser(userId: string): Observable<User> {
    return this.cacheService.get(
      `users:${userId}`,
      () => this._http.get<User>(`${environment.apiUrl}/users/${userId}`).pipe(take(1)),
      1 * 60 * 1000 // 1 minute TTL
    );
  }

  lookupByFirstNameAndLastName(
    firstName: string,
    lastName: string
  ): Observable<{ found: false } | { found: true; user: { _id: string; firstName: string; lastName: string; phoneNumber: string | null } }> {
    const params = { firstName: firstName.trim(), lastName: lastName.trim() };
    return this._http
      .get<{ found: false } | { found: true; user: { _id: string; firstName: string; lastName: string; phoneNumber: string | null } }>(
        `${environment.apiUrl}/users/lookup-by-name`,
        { params }
      )
      .pipe(take(1));
  }

  getClientEnrollmentDetails(userId: string): Observable<ClientEnrollmentDetails> {
    return this.cacheService.get(
      `users:${userId}:enrollments`,
      () => this._http.get<ClientEnrollmentDetails>(`${environment.apiUrl}/users/${userId}/enrollments`).pipe(take(1)),
      1 * 60 * 1000 // 1 minute TTL
    );
  }

  addNewClient(reqObj: { firstName: string, lastName: string, phoneNumber?: string, role?: Role, employeeId?: number | null }): Observable<Object> {
    return this._http.put(`${environment.apiUrl}/users/`, { ...reqObj }).pipe(
      take(1),
      tap(() => {
        // Invalidate user list caches
        this.cacheService.invalidatePattern('users:all*');
        if (reqObj.role) {
          this.cacheService.invalidate(`users:all:${reqObj.role}`);
        }
      })
    );
  }

  updateClient(userId: string, reqObj: { firstName?: string, lastName?: string, phoneNumber?: string, role?: Role, employeeId?: number | null, password?: string }): Observable<User> {
    return this._http.put<User>(`${environment.apiUrl}/users/${userId}`, reqObj).pipe(
      take(1),
      tap(() => {
        // Invalidate caches for this user and user lists
        this.cacheService.invalidate(`users:${userId}`);
        this.cacheService.invalidate(`users:${userId}:enrollments`);
        this.cacheService.invalidate(`users:${userId}:classes`);
        this.cacheService.invalidatePattern('users:all*');
        if (reqObj.role) {
          this.cacheService.invalidate(`users:all:${reqObj.role}`);
        }
      })
    );
  }

  addNote(userId: string, content: string): Observable<User> {
    return this._http.post<User>(`${environment.apiUrl}/users/${userId}/notes`, { content }).pipe(
      take(1),
      tap(() => {
        // Notes affect user details
        this.cacheService.invalidate(`users:${userId}`);
      })
    );
  }

  deleteNote(userId: string, noteId: string): Observable<User> {
    return this._http.delete<User>(`${environment.apiUrl}/users/${userId}/notes/${noteId}`).pipe(
      take(1),
      tap(() => {
        this.cacheService.invalidate(`users:${userId}`);
      })
    );
  }

  getCanDeleteUser(userId: string): Observable<{ canDelete: boolean; reason?: string }> {
    return this._http
      .get<{ canDelete: boolean; reason?: string }>(`${environment.apiUrl}/users/${userId}/can-delete`)
      .pipe(take(1));
  }

  deleteUser(userId: string): Observable<void> {
    return this._http.delete<void>(`${environment.apiUrl}/users/${userId}`).pipe(
      take(1),
      tap(() => {
        this.cacheService.invalidate(`users:${userId}`);
        this.cacheService.invalidate(`users:${userId}:enrollments`);
        this.cacheService.invalidate(`users:${userId}:classes`);
        this.cacheService.invalidatePattern('users:all*');
      })
    );
  }

  getNextEmployeeId(): Observable<{ employeeId: number }> {
    // Don't cache - this is a dynamic value that changes
    return this._http.get<{ employeeId: number }>(`${environment.apiUrl}/users/next-employee-id`).pipe(take(1))
  }

  getEmployeeClassDetails(userId: string): Observable<EmployeeClassDetails> {
    return this.cacheService.get(
      `users:${userId}:classes`,
      () => this._http
        .get<{ instructor: User; assignmentInfo: EmployeeClassDetails["assignmentInfo"] }>(
          `${environment.apiUrl}/users/${userId}/classes`
        )
        .pipe(
          take(1),
          map((res) => ({
            employee: res.instructor,
            assignmentInfo: res.assignmentInfo ?? []
          }))
        ),
      1 * 60 * 1000 // 1 minute TTL
    );
  }
}