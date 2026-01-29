import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { UserService } from '../services/userService';
import { Role } from '@core/types/enums/role';

/** Allows Admin, Employee, or Instructor. Used for time tracking (check-ins). */
@Injectable({
  providedIn: 'root'
})
export class StaffGuard implements CanActivate {
  constructor(
    private userService: UserService,
    private router: Router
  ) {}

  canActivate(): boolean {
    const role = this.userService.user?.role;
    if (role === Role.ADMIN || role === Role.EMPLOYEE || role === Role.INSTRUCTOR) {
      return true;
    }
    this.router.navigate(['/admin/mobile/check-ins']);
    return false;
  }
}
