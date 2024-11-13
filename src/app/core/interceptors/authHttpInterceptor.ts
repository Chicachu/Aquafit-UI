import { inject } from '@angular/core';
import { HttpInterceptorFn } from '@angular/common/http';
import { UserService } from '../services/userService';

export const authHttpInterceptor: HttpInterceptorFn = (req, next) => {
  const userService = inject(UserService)
  let httpRequest = req.clone({
    setHeaders: {
      'Access-Control-Allow-Origin': 'http://localhost:4200',
      'Access-Control-Allow-Headers': 'Origin, X-Requested-With, Content-Type, Accept, Access-Control-Headers, Access-Control-Request-Method, Access-Control-Request-Headers, Authorization',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Content-Type': 'application/json'
    }
  })

  if (userService.user?.accessToken) {
    httpRequest = req.clone({
      setHeaders: {
        'Authorization': 'Bearer ' + userService.user?.accessToken
      }
    })
  }

  return next(httpRequest)
}