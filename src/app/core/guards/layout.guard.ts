import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot } from '@angular/router';
import { BreakpointObserver } from '@angular/cdk/layout';
import { map, tap } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { UserService } from '../services/userService';

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
          const isMobilePath = state.url.includes('mobile');
          const isMobileSize = result.matches;

          if (isMobilePath && isMobileSize) {
            return true;
          }
          if (!isMobilePath && !isMobileSize) {
            return true;
          }

          let targetUrl = this.userService.isAdmin ? ( isMobileSize ? '/admin/mobile/home' : '/admin/home') : '/home';
          console.log('Redirecting to:', targetUrl);
          this.router.navigate([targetUrl]);
          return false;
        })
      );
  }
}