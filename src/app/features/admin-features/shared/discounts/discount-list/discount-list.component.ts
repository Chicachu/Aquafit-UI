import { Component } from "@angular/core";
import { ButtonType } from "../../breadcrumb-nav-bar/breadcrumb-nav-bar.component";
import { Discount } from "@/core/types/discounts/discount";
import { DiscountService } from "@/core/services/discountService";
import { SnackBarService } from "@/core/services/snackBarService";
import { Router } from "@angular/router";

@Component({
  selector: 'app-discount-list',
  templateUrl: './discount-list.component.html',
  styleUrls: ['./discount-list.component.scss']
})
export class DiscountListComponent {
  ButtonType = ButtonType
  discounts: Discount[] | null = null

  constructor(
    private discountService: DiscountService,
    private snackBarService: SnackBarService,
    private router: Router
  ) {
  }

  ngOnInit(): void {
    this.discountService.getAllDiscounts().subscribe({
      next: (discounts: Discount[]) => {
        this.discounts = discounts
        this.discounts.sort((a: Discount, b: Discount) => {
          if (a.description < b.description) return -1
          if (b.description < a.description) return 1
          return 0
        })
      },
      error: ({error}) => {
        this.snackBarService.showError(error.message)
      }
    })
  }

  addNewDiscount(): void {
    this.router.navigate(['/admin/mobile/discounts/add-discount'])
  }
}
