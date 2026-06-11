import { Component } from '@angular/core';
import { AdminNavService } from '../../config/admin-nav.service';
import { MobileNavItem } from '@layouts/mobile/mobile-nav-item';

@Component({
  selector: 'app-admin-desktop-layout',
  templateUrl: './admin-desktop-layout.component.html',
  styleUrl: './admin-desktop-layout.component.scss'
})
export class AdminDesktopLayoutComponent {
  readonly navItems: MobileNavItem[];

  constructor(adminNavService: AdminNavService) {
    this.navItems = adminNavService.getDesktopNavItems();
  }
}
