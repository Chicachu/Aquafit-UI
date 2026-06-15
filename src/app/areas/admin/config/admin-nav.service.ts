import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Role } from '@core/types/enums/role';
import { UserService } from '@core/services/userService';
import { MobileNavItem } from '@layouts/mobile/mobile-nav-item';
import {
  ADMIN_NAV_ITEMS,
  ADMIN_NAV_LABELS,
  AdminNavItemDefinition
} from './admin-nav';

type NavPathKey = 'mobilePath' | 'desktopPath';
export type AdminFeatureKey = keyof typeof ADMIN_NAV_LABELS;

@Injectable({
  providedIn: 'root'
})
export class AdminNavService {
  private readonly adminOnlyLabels = new Set<string>([
    ADMIN_NAV_LABELS.discounts,
    ADMIN_NAV_LABELS.salaryConfiguration,
    ADMIN_NAV_LABELS.employees
  ]);

  private readonly instructorOrAdminLabels = new Set<string>([
    ADMIN_NAV_LABELS.calendar,
    ADMIN_NAV_LABELS.classes,
    ADMIN_NAV_LABELS.clients
  ]);

  /** Time tracking is only available to this specific user */
  private readonly timeTrackingAllowedUsername = 'admin@aquafitvallarta.com';

  constructor(
    private userService: UserService,
    private router: Router
  ) {}

  isMobileAdminRoute(url?: string): boolean {
    const currentUrl = url ?? this.router.url;
    return currentUrl.includes('/admin/mobile');
  }

  getFeatureBasePath(feature: AdminFeatureKey): string {
    const label = ADMIN_NAV_LABELS[feature];
    const item = ADMIN_NAV_ITEMS.find(navItem => navItem.label === label);

    if (!item) {
      throw new Error(`Unknown admin feature: ${feature}`);
    }

    return this.isMobileAdminRoute() ? item.mobilePath : item.desktopPath;
  }

  getFeatureRoute(feature: AdminFeatureKey, ...segments: string[]): string[] {
    const baseSegments = this.getFeatureBasePath(feature).split('/').filter(Boolean);
    return [...baseSegments, ...segments];
  }

  navigateToFeature(feature: AdminFeatureKey, ...segments: string[]): void {
    this.router.navigate(this.getFeatureRoute(feature, ...segments));
  }

  getMobileNavItems(): MobileNavItem[] {
    return this.getNavItems('mobilePath');
  }

  getDesktopNavItems(): MobileNavItem[] {
    return this.getNavItems('desktopPath');
  }

  private getNavItems(pathKey: NavPathKey): MobileNavItem[] {
    const role = this.userService.user?.role;
    const username = this.userService.user?.username ?? '';
    const isInstructor = role === Role.INSTRUCTOR;
    const isReceptionist = role === Role.RECEPTIONIST;
    const isAdminOrManager = this.userService.isAdmin || this.userService.isManager;

    const navItems = ADMIN_NAV_ITEMS.filter(item => {
      if (item.label === ADMIN_NAV_LABELS.checkIns) {
        return username === this.timeTrackingAllowedUsername || this.userService.isManager;
      }
      if (this.adminOnlyLabels.has(item.label)) {
        return isAdminOrManager;
      }
      if (this.instructorOrAdminLabels.has(item.label)) {
        return isAdminOrManager || isInstructor || isReceptionist;
      }
      return true;
    }).map(item => this.toNavItem(item, pathKey));

    const myAccountItem = this.getMyAccountNavItem(pathKey);
    return myAccountItem ? [...navItems, myAccountItem] : navItems;
  }

  private toNavItem(item: AdminNavItemDefinition, pathKey: NavPathKey): MobileNavItem {
    return {
      label: item.label,
      path: item[pathKey]
    };
  }

  private getMyAccountNavItem(pathKey: NavPathKey): MobileNavItem | null {
    const role = this.userService.userRole;
    if (role !== Role.INSTRUCTOR && role !== Role.EMPLOYEE) {
      return null;
    }

    const id = this.userService.user?._id;
    if (!id) {
      return null;
    }

    const path = pathKey === 'mobilePath'
      ? `/admin/mobile/employees/${id}/details`
      : `/admin/employees/${id}/details`;

    return {
      label: ADMIN_NAV_LABELS.myAccount,
      path
    };
  }
}
