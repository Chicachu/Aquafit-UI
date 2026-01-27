import { Injectable } from "@angular/core"
import { Role } from "../types/enums/role"
import { User } from "../types/user"
import { HttpClient } from "@angular/common/http"
import { Observable, take } from "rxjs"
import { environment } from "../../../environments/environment"
import { ClientEnrollmentDetails } from "@core/types/clients/clientEnrollmentDetails"
import { InstructorClassDetails } from "@core/types/instructors/instructorClassDetails"

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private _user: User | null = null

  constructor(private _http: HttpClient) { }

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
      this._user = <User>JSON.parse(sessionStorage.getItem('user')!)
    }
  }

  register(username: string, password: string, role: Role): Observable<User> {
    return this._http.post<User>(`${environment.apiUrl}/users/register`, { username, password, role }).pipe(take(1))
  }

  getAllUsers(role?: Role): Observable<User[]> {
    return this._http.get<User[]>(`${environment.apiUrl}/users?role=${role}`).pipe(take(1))
  }

  getUser(userId: string): Observable<User> {
    return this._http.get<User>(`${environment.apiUrl}/users/${userId}`).pipe(take(1))
  }

  getClientEnrollmentDetails(userId: string): Observable<ClientEnrollmentDetails> {
    return this._http.get<ClientEnrollmentDetails>(`${environment.apiUrl}/users/${userId}/enrollments`).pipe(take(1))
  }

  addNewClient(reqObj: { firstName: string, lastName: string, phoneNumber?: string, role?: Role, instructorId?: number | null }): Observable<Object> {
    return this._http.put(`${environment.apiUrl}/users/`, { ...reqObj }).pipe(take(1))
  }

  updateClient(userId: string, reqObj: { firstName?: string, lastName?: string, phoneNumber?: string, role?: Role, instructorId?: number | null }): Observable<User> {
    return this._http.put<User>(`${environment.apiUrl}/users/${userId}`, reqObj).pipe(take(1))
  }

  addNote(userId: string, content: string): Observable<User> {
    return this._http.post<User>(`${environment.apiUrl}/users/${userId}/notes`, { content }).pipe(take(1))
  }

  deleteNote(userId: string, noteId: string): Observable<User> {
    return this._http.delete<User>(`${environment.apiUrl}/users/${userId}/notes/${noteId}`).pipe(take(1))
  }

  getNextInstructorId(): Observable<{ instructorId: number }> {
    return this._http.get<{ instructorId: number }>(`${environment.apiUrl}/users/instructors/next-id`).pipe(take(1))
  }

  getInstructorClassDetails(userId: string): Observable<InstructorClassDetails> {
    return this._http.get<InstructorClassDetails>(`${environment.apiUrl}/users/${userId}/classes`).pipe(take(1))
  }
}