import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { UserService } from '../services/userService';

/** Allows only Admin or Manager (e.g. salary configuration, discounts). Blocks Receptionist. */
@Injectable({
  providedIn: 'root'
})
export class AdminOrManagerGuard implements CanActivate {
  constructor(
    private userService: UserService,
    private router: Router
  ) {}

  canActivate(): boolean {
    if (this.userService.isAdmin || this.userService.isManager) {
      return true;
    }
    this.router.navigate(['/admin/mobile/classes']);
    return false;
  }
}
