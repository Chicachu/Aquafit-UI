import { Component, Input } from "@angular/core";
import { ActivatedRoute, Route, Router } from "@angular/router";

@Component({
  selector: 'app-mobile-layout',
  templateUrl: './mobile-layout.component.html',
  styleUrl: './mobile-layout.component.scss'
})
export class MobileLayoutComponent {
  navItems: Map<string, string> = new Map() 
  navTitles: string[]

  constructor(private route: ActivatedRoute, private router: Router) {
    this.navItems = this.route.snapshot.data['navItems']
    this.navTitles = Array.from(this.navItems.keys())
  }

  navigate(navItemTitle: string): void {
    console.log(navItemTitle)
    this.router.navigate([`${this.navItems.get(navItemTitle)}`])
  }
}