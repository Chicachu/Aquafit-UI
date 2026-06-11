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
  showInvoiceHistoryPanel = false
  showInvoiceDetailsPanel = false
  activeClassId: string | null = null
  activeUserId: string | null = null
  activeEnrollmentId: string | null = null
  activeInvoiceId: string | null = null

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
    this.activeClassId = this._findParamInRouteTree(this.route, 'class-id')
    this.activeUserId = this._findParamInRouteTree(this.route, 'user-id')
    this.activeEnrollmentId = this._findParamInRouteTree(this.route, 'enrollment-id')
    this.activeInvoiceId = this._findParamInRouteTree(this.route, 'invoice-id')
    this.showEnrollPanel = this._routeTreeHasData(this.route, 'showEnrollPanel')
    this.showInvoiceHistoryPanel = this._routeTreeHasData(this.route, 'showInvoiceHistoryPanel')
    this.showInvoiceDetailsPanel = this._routeTreeHasData(this.route, 'showInvoiceDetailsPanel')
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
