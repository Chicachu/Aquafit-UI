import { Component } from '@angular/core';
import { WebsiteMobileNavService } from '../../config/website-mobile-nav.service';
import { MobileNavItem } from '@layouts/mobile/mobile-nav-item';

/** Public website mobile shell. Not wired to routes yet — see website.routes.ts. */
@Component({
  selector: 'app-website-mobile-layout',
  templateUrl: './website-mobile-layout.component.html',
  styleUrl: './website-mobile-layout.component.scss'
})
export class WebsiteMobileLayoutComponent {
  readonly navItems: MobileNavItem[];

  constructor(websiteMobileNavService: WebsiteMobileNavService) {
    this.navItems = websiteMobileNavService.getNavItems();
  }
}
