import { Injectable } from '@angular/core';
import { MobileNavItem } from '@layouts/mobile/mobile-nav-item';
import { WEBSITE_MOBILE_NAV_ITEMS } from './website-mobile-nav';

@Injectable({
  providedIn: 'root'
})
export class WebsiteMobileNavService {
  getNavItems(): MobileNavItem[] {
    return WEBSITE_MOBILE_NAV_ITEMS;
  }
}
