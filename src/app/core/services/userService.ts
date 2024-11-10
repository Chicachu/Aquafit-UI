import { Injectable } from "@angular/core"
import { Role } from "../types/enums/role"
import { User } from "../types/user"

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private _user: User | null = null

  constructor() { }

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

  private _checkSessionStorage() {
    if (!this._user) {
      this._user = <User>JSON.parse(sessionStorage.getItem('user')!)
    }
  }
}