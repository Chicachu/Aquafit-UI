import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { filter, Subscription } from 'rxjs';

@Component({
  selector: 'app-classes-desktop-page',
  templateUrl: './classes-desktop-page.component.html',
  styleUrls: ['./classes-desktop-page.component.scss']
})
export class ClassesDesktopPageComponent implements OnInit, OnDestroy {
  showEnrollPanel = false
  activeClassId: string | null = null

  private routerSubscription?: Subscription

  constructor(
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this._syncFromRoute()
    this.routerSubscription = this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd)
    ).subscribe(() => this._syncFromRoute())
  }

  ngOnDestroy(): void {
    this.routerSubscription?.unsubscribe()
  }

  private _syncFromRoute(): void {
    this.activeClassId = this._findClassIdInRouteTree(this.route)
    this.showEnrollPanel = this._routeTreeHasData(this.route, 'showEnrollPanel')
  }

  private _findClassIdInRouteTree(route: ActivatedRoute): string | null {
    const classId = route.snapshot.paramMap.get('class-id')
    if (classId) {
      return classId
    }

    if (route.firstChild) {
      return this._findClassIdInRouteTree(route.firstChild)
    }

    return null
  }

  private _routeTreeHasData(route: ActivatedRoute, key: string): boolean {
    if (route.snapshot.data[key] === true) {
      return true
    }

    if (route.firstChild) {
      return this._routeTreeHasData(route.firstChild, key)
    }

    return false
  }
}
