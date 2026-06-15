import { inject } from '@angular/core';
import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { UserService } from '../services/userService';
import { Language } from '../types/enums/language';

function getPreferredLanguage(): string {
  const savedLang = localStorage.getItem('preferred-language');
  if (savedLang === Language.ES || savedLang === Language.EN) {
    return savedLang;
  }
  return Language.EN;
}

export const authHttpInterceptor: HttpInterceptorFn = (req, next) => {
  const userService = inject(UserService);
  const router = inject(Router);
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'Accept-Language': getPreferredLanguage()
  };
  if (userService.user?.accessToken) {
    headers['Authorization'] = 'Bearer ' + userService.user.accessToken;
  }
  const httpRequest = req.clone({ setHeaders: headers });
  return next(httpRequest).pipe(
    catchError((err: HttpErrorResponse) => {
      if (err.status === 401) {
        userService.clearSession();
        router.navigate(['/login']);
      }
      return throwError(() => err);
    })
  );
};