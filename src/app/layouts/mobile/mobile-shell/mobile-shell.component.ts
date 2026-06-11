import { Component, HostListener, Input } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs/operators';
import { MobileNavItem } from '../mobile-nav-item';
import { getActiveNavItem } from '@layouts/shared/nav-list.utils';

@Component({
  selector: 'app-mobile-shell',
  templateUrl: './mobile-shell.component.html',
  styleUrl: './mobile-shell.component.scss'
})
export class MobileShellComponent {
  @Input() navItems: MobileNavItem[] = [];

  isMenuOpen = false;
  currentRoute = '';

  constructor(private router: Router) {
    this.currentRoute = this.router.url;
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        this.currentRoute = event.urlAfterRedirects;
      });
  }

  toggleMenu(): void {
    this.isMenuOpen = !this.isMenuOpen;
  }

  navigate(item: MobileNavItem, event?: Event): void {
    if (event) {
      event.preventDefault();
    }
    this.router.navigate([item.path]);
    this.isMenuOpen = false;
  }

  isActive(item: MobileNavItem): boolean {
    return getActiveNavItem(this.currentRoute, this.navItems)?.path === item.path;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    const menuContainer = document.querySelector('.mobile-nav-container');

    if (menuContainer && !menuContainer.contains(target) && this.isMenuOpen) {
      this.isMenuOpen = false;
    }
  }

}
