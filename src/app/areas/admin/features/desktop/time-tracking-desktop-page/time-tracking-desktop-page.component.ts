import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { filter, Subscription } from 'rxjs';

@Component({
  selector: 'app-time-tracking-desktop-page',
  templateUrl: './time-tracking-desktop-page.component.html',
  styleUrls: ['./time-tracking-desktop-page.component.scss']
})
export class TimeTrackingDesktopPageComponent implements OnInit, OnDestroy {
  activeUserId: string | null = null;
  activeYear: number | null = null;
  activeMonth: number | null = null;

  private routerSubscription?: Subscription;

  constructor(
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this._syncFromRoute();
    this.routerSubscription = this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd)
    ).subscribe(() => this._syncFromRoute());
  }

  ngOnDestroy(): void {
    this.routerSubscription?.unsubscribe();
  }

  private _syncFromRoute(): void {
    this.activeUserId = this._findParamInRouteTree(this.route, 'user-id');

    const year = this._findParamInRouteTree(this.route, 'year');
    const month = this._findParamInRouteTree(this.route, 'month');
    this.activeYear = year ? parseInt(year, 10) : null;
    this.activeMonth = month ? parseInt(month, 10) : null;
  }

  private _findParamInRouteTree(route: ActivatedRoute, param: string): string | null {
    const value = route.snapshot.paramMap.get(param);
    if (value) {
      return value;
    }

    if (route.firstChild) {
      return this._findParamInRouteTree(route.firstChild, param);
    }

    return null;
  }
}
