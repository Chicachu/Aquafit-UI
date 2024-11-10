import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpEvent, HttpRequest, HttpHandler } from '@angular/common/http';
import { finalize, Observable } from 'rxjs';
import { UserService } from '../services/userService';

@Injectable()
export class AuthHttpInterceptor implements HttpInterceptor {
  totalRequests = 0

  constructor(private _userService: UserService) { }

  intercept(httpRequest: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    this.totalRequests++
    
    httpRequest = httpRequest.clone({
      setHeaders: {
        'Access-Control-Allow-Origin': 'http://localhost:4200',
        'Access-Control-Allow-Headers': 'Origin, X-Requested-With, Content-Type, Accept, Access-Control-Headers, Access-Control-Request-Method, Access-Control-Request-Headers, Authorization',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Content-Type': 'application/json'
      }
    })

    if (this._userService.user?.accessToken) {
      httpRequest = httpRequest.clone({
        setHeaders: {
          'Authorization': 'Bearer ' + this._userService.user?.accessToken
        }
      })
    }

    return next.handle(httpRequest).pipe(
      finalize(() => {
        this.totalRequests--
      })
    )
  }
}