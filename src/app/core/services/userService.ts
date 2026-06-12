import { Injectable } from "@angular/core"
import { Role } from "../types/enums/role"
import { User } from "../types/user"
import { HttpClient } from "@angular/common/http"
import { Observable, take, tap } from "rxjs"
import { environment } from "../../../environments/environment"
import { CacheService } from "./cacheService"
import { CACHE_TTL } from "./cacheTtl"

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
    localStorage.setItem('user', JSON.stringify(this._user))
  }

  get user(): User | null {
    this._restoreFromStorage()
    return this._user
  }

  get isUserLoggedIn(): boolean {
    this._restoreFromStorage()
    return !!this._user
  }

  get userRole(): Role | undefined {
    this._restoreFromStorage()
    return this._user?.role
  }

  get isAdmin(): boolean {
    this._restoreFromStorage()
    return this._user?.role === Role.ADMIN
  }

  get isManager(): boolean {
    this._restoreFromStorage()
    return this._user?.role === Role.MANAGER
  }

  get isReceptionist(): boolean {
    this._restoreFromStorage()
    return this._user?.role === Role.RECEPTIONIST
  }

  private _restoreFromStorage(): void {
    if (!this._user) {
      try {
        const raw = localStorage.getItem('user')
        const parsed = raw ? JSON.parse(raw) : null
        this._user = parsed && typeof parsed === 'object' && parsed._id && parsed.accessToken ? parsed : null
        if (!this._user && raw) localStorage.removeItem('user')
      } catch {
        this._user = null
        localStorage.removeItem('user')
      }
    }
  }

  clearSession(): void {
    this._user = null
    localStorage.removeItem('user')
    this.cacheService.clear()
  }

  register(username: string, password: string, role: Role): Observable<User> {
    return this._http.post<User>(`${environment.apiUrl}/users/register`, { username, password, role }).pipe(take(1))
  }

  getAllUsers(role?: Role): Observable<User[]> {
    const cacheKey = role ? `users:all:${role}` : 'users:all';
    return this.cacheService.get(
      cacheKey,
      () => this._http.get<User[]>(`${environment.apiUrl}/users?role=${role}`).pipe(take(1)),
      CACHE_TTL.LONG
    );
  }

  getUser(userId: string): Observable<User> {
    return this.cacheService.get(
      `users:${userId}`,
      () => this._http.get<User>(`${environment.apiUrl}/users/${userId}`).pipe(take(1)),
      CACHE_TTL.MEDIUM
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

  addNewClient(reqObj: { firstName: string, lastName: string, phoneNumber?: string, role?: Role, employeeId?: number | null, workLocation?: string | null }): Observable<User> {
    return this._http.put<User>(`${environment.apiUrl}/users/`, { ...reqObj }).pipe(
      take(1),
      tap((created) => {
        this._invalidateUserCaches(created._id, reqObj.role);
      })
    );
  }

  updateClient(userId: string, reqObj: { firstName?: string, lastName?: string, phoneNumber?: string, role?: Role, employeeId?: number | null, workLocation?: string | null, password?: string }): Observable<User> {
    return this._http.put<User>(`${environment.apiUrl}/users/${userId}`, reqObj).pipe(
      take(1),
      tap(() => {
        this._invalidateUserCaches(userId, reqObj.role);
      })
    );
  }

  addNote(userId: string, content: string): Observable<User> {
    return this._http.post<User>(`${environment.apiUrl}/users/${userId}/notes`, { content }).pipe(
      take(1),
      tap(() => {
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
    return this.cacheService.get(
      `users:${userId}:can-delete`,
      () => this._http
        .get<{ canDelete: boolean; reason?: string }>(`${environment.apiUrl}/users/${userId}/can-delete`)
        .pipe(take(1)),
      CACHE_TTL.MEDIUM
    );
  }

  deleteUser(userId: string): Observable<void> {
    return this._http.delete<void>(`${environment.apiUrl}/users/${userId}`).pipe(
      take(1),
      tap(() => {
        this._invalidateUserCaches(userId);
        this.cacheService.invalidate('enrollments:active');
        this.cacheService.invalidate('waitlist:all');
        this.cacheService.invalidatePattern('classes:details:*');
        this.cacheService.invalidatePattern('schedule:*');
      })
    );
  }

  getNextEmployeeId(): Observable<{ employeeId: number }> {
    // Don't cache - this is a dynamic value that changes
    return this._http.get<{ employeeId: number }>(`${environment.apiUrl}/users/next-employee-id`).pipe(take(1))
  }

  private _invalidateUserCaches(userId: string, role?: Role): void {
    this.cacheService.invalidate(`users:${userId}`);
    this.cacheService.invalidate(`users:${userId}:can-delete`);
    this.cacheService.invalidate(`enrollments:users:${userId}`);
    this.cacheService.invalidate(`schedules:users:${userId}:classes`);
    this.cacheService.invalidatePattern('users:all*');
    if (role) {
      this.cacheService.invalidate(`users:all:${role}`);
    }
  }
}