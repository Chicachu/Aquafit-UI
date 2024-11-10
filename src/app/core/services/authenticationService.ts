import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http'
import { Observable, take } from 'rxjs';
import { User } from '../types/user';
import { Role } from '../types/enums/role';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthenticationService {

  constructor(private _http: HttpClient) { }

  login(username: string, password: string): Observable<User> {
    return this._http.post<User>(`${environment.apiUrl}/auth/login`, { username, password }).pipe(take(1))
  }
}