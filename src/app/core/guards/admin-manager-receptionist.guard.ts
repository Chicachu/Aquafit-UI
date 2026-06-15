import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { UserService } from '../services/userService';

/** Allows Admin, Manager, or Receptionist (e.g. add/edit clients). */
@Injectable({
  providedIn: 'root'
})
export class AdminManagerReceptionistGuard implements CanActivate {
  constructor(
    private userService: UserService,
    private router: Router
  ) {}

  canActivate(): boolean {
    if (this.userService.isAdmin || this.userService.isManager || this.userService.isReceptionist) {
      return true;
    }
    this.router.navigate(['/admin/clients']);
    return false;
  }
}
