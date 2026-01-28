import { Component, HostListener } from "@angular/core";
import { ActivatedRoute, Router, NavigationEnd } from "@angular/router";
import { filter } from "rxjs/operators";
import { UserService } from "@core/services/userService";

@Component({
  selector: 'app-mobile-layout',
  templateUrl: './mobile-layout.component.html',
  styleUrl: './mobile-layout.component.scss'
})
export class MobileLayoutComponent {
  navItems: Map<string, string> = new Map() 
  navTitles: string[] = []
  isMenuOpen: boolean = false
  currentRoute: string = ''

  // Admin-only menu items
  private readonly adminOnlyItems = ['NAVIGATION.DISCOUNTS', 'NAVIGATION.SALARY_CONFIGURATION', 'NAVIGATION.EMPLOYEES']

  constructor(
    private route: ActivatedRoute, 
    private router: Router,
    private userService: UserService
  ) {
    const allNavItems = this.route.snapshot.data['navItems'] as Map<string, string>
    
    // Filter menu items based on admin status
    this.navItems = new Map()
    for (const [title, path] of allNavItems.entries()) {
      if (!this.adminOnlyItems.includes(title) || this.userService.isAdmin) {
        this.navItems.set(title, path)
      }
    }
    
    this.navTitles = Array.from(this.navItems.keys())
    
    // Track current route
    this.currentRoute = this.router.url
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        this.currentRoute = event.urlAfterRedirects
      })
  }

  toggleMenu(): void {
    this.isMenuOpen = !this.isMenuOpen
  }

  navigate(navItemTitle: string, event?: Event): void {
    if (event) {
      event.preventDefault()
    }
    this.router.navigate([`${this.navItems.get(navItemTitle)}`])
    this.isMenuOpen = false // Close menu after navigation
  }

  getActiveNavItem(): string | null {
    if (!this.currentRoute) return null
    
    const normalizedCurrentRoute = this.currentRoute.replace(/\/$/, '')
    let bestMatch: { title: string; path: string; length: number } | null = null
    
    // Find the best matching nav item
    for (const [title, path] of this.navItems.entries()) {
      const normalizedPath = path.replace(/\/$/, '')
      
      // Exact match
      if (normalizedCurrentRoute === normalizedPath) {
        return title
      }
      
      // Check if current route is a child of this nav path
      if (normalizedCurrentRoute.startsWith(normalizedPath + '/')) {
        if (!bestMatch || normalizedPath.length > bestMatch.length) {
          bestMatch = { title, path: normalizedPath, length: normalizedPath.length }
        }
      }
    }
    
    return bestMatch ? bestMatch.title : null
  }

  isActive(navItemTitle: string): boolean {
    return this.getActiveNavItem() === navItemTitle
  }

  getNavItemLabel(title: string): string {
    return title
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement
    const menuContainer = document.querySelector('.mobile-nav-container')
    
    if (menuContainer && !menuContainer.contains(target) && this.isMenuOpen) {
      this.isMenuOpen = false
    }
  }
}