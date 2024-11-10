import { Component } from '@angular/core';
import { UserService } from '../../core/services/userService';
import { Router } from '@angular/router';
import { SnackBarService } from '../../core/services/snackBarService';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-admin-layout',
  templateUrl: './admin-layout.component.html',
  styleUrl: './admin-layout.component.scss'
})
export class AdminLayoutComponent {
  constructor(
    private userService: UserService, 
    private router: Router, 
    private snackBarService: SnackBarService,
    private translateService: TranslateService
    ) {}

  ngOnInit(): void {
    if (!this.userService.isUserLoggedIn) {
      this.snackBarService.showError(this.translateService.instant('ERRORS.ACCESS_DENIED'))
      this.router.navigate(['/login'])
    }
  }
}
