import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { UserService } from '../services/userService';

/** Allows Admin, Manager, or Receptionist (e.g. add clients/classes, time tracking). */
@Injectable({
  providedIn: 'root'
})
export class AdminManagerReceptionistGuard implements CanActivate {
  constructor(
    private userService: UserService,
    private router: Router
  ) {}

  canActivate(): boolean {
    if (this.userService.canManageTimeTracking) {
      return true;
    }
    this.router.navigate(['/admin/clients']);
    return false;
  }
}
