import { Component, OnInit } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { DiscountService } from "@/core/services/discountService";
import { UserService } from "@/core/services/userService";
import { Discount } from "@/core/types/discounts/discount";
import { SnackBarService } from "@/core/services/snackBarService";
import { ButtonType } from "../../breadcrumb-nav-bar/breadcrumb-nav-bar.component";

@Component({
  selector: 'app-discount-details',
  templateUrl: './discount-details.component.html',
  styleUrls: ['./discount-details.component.scss']
})
export class DiscountDetailsComponent implements OnInit {
  ButtonType = ButtonType
  discount: Discount | null = null
  navBarInfo: string[] = []
  loading = false
  canEditDiscount = false

  constructor(
    private discountService: DiscountService,
    private userService: UserService,
    private route: ActivatedRoute,
    private router: Router,
    private snackBarService: SnackBarService
  ) {}

  ngOnInit(): void {
    this.canEditDiscount = this.userService.isAdmin
    const discountId = this.route.snapshot.paramMap.get('discount-id')
    if (discountId) {
      this.discountService.getDiscount(discountId).subscribe({
        next: (discount: any) => {
          // Transform API response (startDate/endDate) to UI format (period)
          this.discount = {
            ...discount,
            period: discount.startDate ? {
              startDate: new Date(discount.startDate),
              endDate: discount.endDate ? new Date(discount.endDate) : undefined
            } : undefined
          }
        },
        error: ({error}) => {
          this.snackBarService.showError(error.message)
        }
      })
    }
  }

  editDiscount(): void {
    if (this.discount) {
      this.router.navigate(['../edit'], { relativeTo: this.route })
    }
  }
}
