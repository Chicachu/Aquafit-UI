import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot } from '@angular/router';
import { UserService } from '../services/userService';

const TIME_TRACKING_ALLOWED_USERNAME = 'admin@aquafitvallarta.com';

@Injectable({
  providedIn: 'root'
})
export class TimeTrackingGuard implements CanActivate {
  constructor(
    private userService: UserService,
    private router: Router
  ) {}

  canActivate(_route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    const username = this.userService.user?.username;
    if (username === TIME_TRACKING_ALLOWED_USERNAME || this.userService.isManager) {
      return true;
    }

    const isDesktop = !state.url.includes('/admin/mobile');
    this.router.navigate([isDesktop ? '/admin/classes' : '/admin/mobile/classes']);
    return false;
  }
}
