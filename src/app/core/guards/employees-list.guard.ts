import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot } from '@angular/router';
import { UserService } from '../services/userService';

/** Allows Admin or Manager to view the employees list (and details/payments). */
@Injectable({
  providedIn: 'root'
})
export class EmployeesListGuard implements CanActivate {
  constructor(
    private userService: UserService,
    private router: Router
  ) {}

  canActivate(_route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    if (this.userService.isAdmin || this.userService.isManager) {
      return true;
    }

    const isDesktopEmployees = state.url.includes('/admin/employees');
    this.router.navigate([isDesktopEmployees ? '/admin/home' : '/admin/mobile/home']);
    return false;
  }
}
