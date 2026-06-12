import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { filter, Subscription } from 'rxjs';

@Component({
  selector: 'app-employees-desktop-page',
  templateUrl: './employees-desktop-page.component.html',
  styleUrls: ['./employees-desktop-page.component.scss']
})
export class EmployeesDesktopPageComponent implements OnInit, OnDestroy {
  showPaymentOverviewPanel = false
  showPayableDetailsPanel = false
  activeUserId: string | null = null
  activePayableId: string | null = null

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
    this.activeUserId = this._findParamInRouteTree(this.route, 'user-id')
    this.activePayableId = this._findParamInRouteTree(this.route, 'payable-id')
    this.showPaymentOverviewPanel = this._routeTreeHasData(this.route, 'showPaymentOverviewPanel')
    this.showPayableDetailsPanel = this._routeTreeHasData(this.route, 'showPayableDetailsPanel')
  }

  private _findParamInRouteTree(route: ActivatedRoute, param: string): string | null {
    const value = route.snapshot.paramMap.get(param)
    if (value) {
      return value
    }

    if (route.firstChild) {
      return this._findParamInRouteTree(route.firstChild, param)
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
