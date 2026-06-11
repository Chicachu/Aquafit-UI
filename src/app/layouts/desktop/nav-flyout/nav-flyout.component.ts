import { Component, Input } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs/operators';
import { MobileNavItem } from '@layouts/mobile/mobile-nav-item';
import { getActiveNavItem } from '@layouts/shared/nav-list.utils';

@Component({
  selector: 'app-nav-flyout',
  templateUrl: './nav-flyout.component.html',
  styleUrl: './nav-flyout.component.scss'
})
export class NavFlyoutComponent {
  @Input() navItems: MobileNavItem[] = [];

  isOpen = false;
  currentRoute = '';

  constructor(private router: Router) {
    this.currentRoute = this.router.url;
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        this.currentRoute = event.urlAfterRedirects;
      });
  }

  open(): void {
    this.isOpen = true;
  }

  close(): void {
    this.isOpen = false;
  }

  navigate(item: MobileNavItem, event?: Event): void {
    if (event) {
      event.preventDefault();
    }
    this.router.navigate([item.path]);
  }

  isActive(item: MobileNavItem): boolean {
    return getActiveNavItem(this.currentRoute, this.navItems)?.path === item.path;
  }
}
