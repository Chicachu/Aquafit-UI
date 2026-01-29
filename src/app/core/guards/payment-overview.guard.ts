import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, Router } from '@angular/router';
import { UserService } from '../services/userService';
import { Role } from '@core/types/enums/role';

/**
 * For routes like employees/:user-id/payments.
 * Allow: admin (any), or instructor/employee viewing their own user-id (My Account).
 */
@Injectable({
  providedIn: 'root'
})
export class PaymentOverviewGuard implements CanActivate {
  constructor(
    private userService: UserService,
    private router: Router
  ) {}

  canActivate(route: ActivatedRouteSnapshot): boolean {
    const role = this.userService.user?.role;
    const userId = route.paramMap.get('user-id');
    const selfId = this.userService.user?._id;

    if (this.userService.isAdmin) return true;
    if ((role === Role.INSTRUCTOR || role === Role.EMPLOYEE) && userId && selfId && userId === selfId) {
      return true;
    }
    this.router.navigate(['/admin/mobile/check-ins']);
    return false;
  }
}
