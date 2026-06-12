import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable, take, tap } from "rxjs";
import { Discount } from "../types/discounts/discount";
import { environment } from "../../../environments/environment";
import { CacheService } from "./cacheService";
import { CACHE_TTL } from "./cacheTtl";

@Injectable({
  providedIn: 'root'
})
export class DiscountService {
  private readonly _allDiscountsKey = 'discounts:all';

  constructor(
    private http: HttpClient,
    private cacheService: CacheService
  ) {}

  getAllDiscounts(): Observable<Discount[]> {
    return this.cacheService.get(
      this._allDiscountsKey,
      () => this.http.get<Discount[]>(`${environment.apiUrl}/discounts`).pipe(take(1)),
      CACHE_TTL.STATIC
    );
  }

  getDiscount(discountId: string): Observable<Discount> {
    return this.cacheService.get(
      `discounts:${discountId}`,
      () => this.http.get<Discount>(`${environment.apiUrl}/discounts/${discountId}`).pipe(take(1)),
      CACHE_TTL.LONG
    );
  }

  createDiscount(discountData: unknown): Observable<Discount> {
    return this.http.post<Discount>(`${environment.apiUrl}/discounts`, discountData).pipe(
      take(1),
      tap((created) => this._invalidateDiscountCaches(created._id))
    );
  }

  updateDiscount(discountId: string, discountData: unknown): Observable<Discount> {
    return this.http.put<Discount>(`${environment.apiUrl}/discounts/${discountId}`, discountData).pipe(
      take(1),
      tap(() => this._invalidateDiscountCaches(discountId))
    );
  }

  private _invalidateDiscountCaches(discountId?: string): void {
    this.cacheService.invalidate(this._allDiscountsKey);
    if (discountId) {
      this.cacheService.invalidate(`discounts:${discountId}`);
    }
  }
}
