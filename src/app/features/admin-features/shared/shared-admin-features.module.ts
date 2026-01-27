import { NgModule } from "@angular/core";
import { BreadcrumbNavBarComponent } from './breadcrumb-nav-bar/breadcrumb-nav-bar.component'
import { ClientListComponent } from "./clients/client-list/client-list.component";
import { SharedModule } from "../../../shared/shared.module";
import { CommonModule } from "@angular/common";
import { ClientDetailsComponent } from "./clients/client-details/client-details.component";
import { EditClientComponent } from "./clients/edit-client/edit-client.component";
import { ClassListComponent } from "./classes/class-list/class-list.component";
import { EditClassComponent } from "./classes/edit-class/edit-class.component";
import { ClassDetailsComponent } from "./classes/class-details/class-details.component";
import { MobileCalendarComponent } from "./calendar/mobile-calendar/mobile-calendar.component";
import { InvoiceHistoryComponent } from "./payments/invoice-history/invoice-history.component";
import { InvoiceDetailsComponent } from "./payments/invoice-details/invoice-details.component";
import { DiscountListComponent } from "./discounts/discount-list/discount-list.component";
import { DiscountDetailsComponent } from "./discounts/discount-details/discount-details.component";
import { EditDiscountComponent } from "./discounts/edit-discount/edit-discount.component";
import { InstructorsDetailsComponent } from "./instructors/instructors-details/instructors-details.component";
import { InstructorPaymentOverviewComponent } from "./instructors/instructor-payment-overview/instructor-payment-overview.component";

@NgModule({
  declarations: [
    BreadcrumbNavBarComponent,
    EditClientComponent,
    EditClassComponent, 
    ClientListComponent,
    ClientDetailsComponent,
    ClassListComponent,
    ClassDetailsComponent,
    MobileCalendarComponent,
    InvoiceHistoryComponent,
    InvoiceDetailsComponent,
    DiscountListComponent,
    DiscountDetailsComponent,
    EditDiscountComponent,
    InstructorsDetailsComponent,
    InstructorPaymentOverviewComponent
  ],
  imports: [
    CommonModule,
    SharedModule
  ],
  exports: [
    SharedModule,
    MobileCalendarComponent
  ]
})
export class SharedAdminFeaturesModule { }