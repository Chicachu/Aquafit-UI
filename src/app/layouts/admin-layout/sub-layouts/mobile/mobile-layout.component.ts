import { Component, Input } from "@angular/core";
import { ActivatedRoute, Route } from "@angular/router";

@Component({
  selector: 'app-mobile-layout',
  templateUrl: './mobile-layout.component.html',
  styleUrl: './mobile-layout.component.scss'
})
export class MobileLayoutComponent {
  navItems: string[] = [] 

  constructor(private route: ActivatedRoute) {
    this.navItems = this.route.snapshot.data['navItems']
  }
}