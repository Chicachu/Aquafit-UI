import { inject } from '@angular/core';
import { HttpInterceptorFn } from '@angular/common/http';
import { UserService } from '../services/userService';

export const authHttpInterceptor: HttpInterceptorFn = (req, next) => {
  const userService = inject(UserService)
  const headers: Record<string, string> = {
    'Content-Type': 'application/json'
  }
  if (userService.user?.accessToken) {
    headers['Authorization'] = 'Bearer ' + userService.user.accessToken
  }
  const httpRequest = req.clone({ setHeaders: headers })
  return next(httpRequest)
}