import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable, take } from "rxjs";
import { Discount } from "../types/discounts/discount";
import { environment } from "../../../environments/environment";

@Injectable({
  providedIn: 'root'
})
export class DiscountService {
  constructor(private http: HttpClient) {}

  getAllDiscounts(): Observable<Discount[]> {
    return this.http.get<Discount[]>(`${environment.apiUrl}/discounts`).pipe(take(1))
  }

  getDiscount(discountId: string): Observable<Discount> {
    return this.http.get<Discount>(`${environment.apiUrl}/discounts/${discountId}`).pipe(take(1))
  }

  createDiscount(discountData: any): Observable<Discount> {
    return this.http.post<Discount>(`${environment.apiUrl}/discounts`, discountData).pipe(take(1))
  }

  updateDiscount(discountId: string, discountData: any): Observable<Discount> {
    return this.http.put<Discount>(`${environment.apiUrl}/discounts/${discountId}`, discountData).pipe(take(1))
  }
}
