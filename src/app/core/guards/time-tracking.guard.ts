import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
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

  canActivate(): boolean {
    const username = this.userService.user?.username;
    if (username === TIME_TRACKING_ALLOWED_USERNAME) {
      return true;
    }
    this.router.navigate(['/admin/mobile/classes']);
    return false;
  }
}
