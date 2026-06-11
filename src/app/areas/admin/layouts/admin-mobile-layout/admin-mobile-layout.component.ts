import { Component } from '@angular/core';
import { AdminNavService } from '../../config/admin-nav.service';
import { MobileNavItem } from '@layouts/mobile/mobile-nav-item';

@Component({
  selector: 'app-admin-mobile-layout',
  templateUrl: './admin-mobile-layout.component.html',
  styleUrl: './admin-mobile-layout.component.scss'
})
export class AdminMobileLayoutComponent {
  readonly navItems: MobileNavItem[];

  constructor(adminNavService: AdminNavService) {
    this.navItems = adminNavService.getMobileNavItems();
  }
}
