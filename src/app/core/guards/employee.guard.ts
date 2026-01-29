import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { UserService } from '../services/userService';
import { Role } from '@core/types/enums/role';

@Injectable({
  providedIn: 'root'
})
export class EmployeeGuard implements CanActivate {
  constructor(
    private userService: UserService,
    private router: Router
  ) {}

  canActivate(): boolean {
    const role = this.userService.user?.role;
    if (role === Role.EMPLOYEE || role === Role.INSTRUCTOR) {
      return true;
    }
    this.router.navigate(['/admin/mobile/classes']);
    return false;
  }
}
