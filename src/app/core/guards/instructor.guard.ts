import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { UserService } from '../services/userService';
import { Role } from '@core/types/enums/role';

@Injectable({
  providedIn: 'root'
})
export class InstructorGuard implements CanActivate {
  constructor(
    private userService: UserService,
    private router: Router
  ) {}

  canActivate(): boolean {
    if (this.userService.user?.role === Role.INSTRUCTOR) {
      return true;
    }
    this.router.navigate(['/admin/mobile/classes']);
    return false;
  }
}
