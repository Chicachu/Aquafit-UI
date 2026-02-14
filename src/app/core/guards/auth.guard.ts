import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { UserService } from '../services/userService';

export const authGuard = () => {
  const userService = inject(UserService);
  const router = inject(Router);

  if (userService.isUserLoggedIn) {
    return true;
  }
  router.navigate(['/login']);
  return false;
};
