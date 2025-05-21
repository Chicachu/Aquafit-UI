import { Injectable } from "@angular/core"
import { Role } from "../types/enums/role"
import { User } from "../types/user"
import { HttpClient } from "@angular/common/http"
import { Observable, take } from "rxjs"
import { environment } from "../../../environments/environment"

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

  addNewClient(reqObj: { firstName: string, lastName: string, phoneNumber: string }): Observable<Object> {
    return this._http.put(`${environment.apiUrl}/users/`, { ...reqObj }).pipe(take(1))
  }
}