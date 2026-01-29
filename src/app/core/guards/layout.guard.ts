import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot } from '@angular/router';
import { BreakpointObserver } from '@angular/cdk/layout';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { UserService } from '../services/userService';
import { Role } from '@core/types/enums/role';

@Injectable({
  providedIn: 'root'
})
export class LayoutGuard implements CanActivate {
  constructor(
    private breakpointObserver: BreakpointObserver,
    private router: Router,
    private userService: UserService
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> {
    return this.breakpointObserver
      .observe(['(max-width: 500px)'])
      .pipe(
        map(result => {
          const isMobilePath = state.url.includes('mobile')
          const isMobileSize = result.matches

          if (isMobilePath && isMobileSize) {
            return true
          }
          if (!isMobilePath && !isMobileSize) {
            return true
          }
          
          const isStaff = this.userService.user?.role === Role.ADMIN ||
            this.userService.user?.role === Role.INSTRUCTOR ||
            this.userService.user?.role === Role.EMPLOYEE
          const targetUrl = isStaff
            ? (isMobileSize ? '/admin/mobile/home' : '/admin/home')
            : '/home'
          this.router.navigate([targetUrl])
          return false;
        })
      );
  }
}