import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot } from '@angular/router';
import { UserService } from '../services/userService';

/** Allows Admin, Manager, or Receptionist to manage employee check-ins. */
@Injectable({
  providedIn: 'root'
})
export class TimeTrackingGuard implements CanActivate {
  constructor(
    private userService: UserService,
    private router: Router
  ) {}

  canActivate(_route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    if (this.userService.canManageTimeTracking) {
      return true;
    }

    const isDesktop = !state.url.includes('/admin/mobile');
    this.router.navigate([isDesktop ? '/admin/classes' : '/admin/mobile/classes']);
    return false;
  }
}
