import { NgModule } from "@angular/core";
import { MatRadioModule } from "@angular/material/radio";
import { BreadcrumbNavBarComponent } from './breadcrumb-nav-bar/breadcrumb-nav-bar.component'
import { ClientListComponent } from "./clients/client-list/client-list.component";
import { SharedModule } from "../../../shared/shared.module";
import { CommonModule } from "@angular/common";
import { TranslateModule } from "@ngx-translate/core";
import { ClientDetailsComponent } from "./clients/client-details/client-details.component";
import { EditClientComponent } from "./clients/edit-client/edit-client.component";
import { ClassListComponent } from "./classes/class-list/class-list.component";
import { EditClassComponent } from "./classes/edit-class/edit-class.component";
import { ClassDetailsComponent } from "./classes/class-details/class-details.component";
import { ClassCalendarComponent } from "./calendar/class-calendar/class-calendar.component";
import { InvoiceHistoryComponent } from "./payments/invoice-history/invoice-history.component";
import { InvoiceDetailsComponent } from "./payments/invoice-details/invoice-details.component";
import { DiscountListComponent } from "./discounts/discount-list/discount-list.component";
import { DiscountDetailsComponent } from "./discounts/discount-details/discount-details.component";
import { EditDiscountComponent } from "./discounts/edit-discount/edit-discount.component";
import { EmployeeDetailsComponent } from "./employees/employee-details/employee-details.component";
import { EmployeePaymentOverviewComponent } from "./employees/employee-payment-overview/employee-payment-overview.component";
import { EmployeesListComponent } from "./employees/employees-list/employees-list.component";
import { AddEmployeeComponent } from "./employees/add-employee/add-employee.component";
import { EditEmployeeComponent } from "./employees/edit-employee/edit-employee.component";
import { SalaryConfigurationComponent } from "./salary-configuration/salary-configuration.component";
import { CheckInsComponent } from "./check-ins/check-ins.component";
import { EmployeePayableDetailsComponent } from "./employees/employee-payable-details/employee-payable-details.component";

@NgModule({
  declarations: [
    BreadcrumbNavBarComponent,
    EditClientComponent,
    EditClassComponent, 
    ClientListComponent,
    ClientDetailsComponent,
    ClassListComponent,
    ClassDetailsComponent,
    ClassCalendarComponent,
    InvoiceHistoryComponent,
    InvoiceDetailsComponent,
    DiscountListComponent,
    DiscountDetailsComponent,
    EditDiscountComponent,
    EmployeeDetailsComponent,
    EmployeePaymentOverviewComponent,
    EmployeesListComponent,
    AddEmployeeComponent,
    EditEmployeeComponent,
    SalaryConfigurationComponent,
    CheckInsComponent,
    EmployeePayableDetailsComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
    TranslateModule,
    MatRadioModule
  ],
  exports: [
    SharedModule,
    ClassCalendarComponent
  ]
})
export class SharedAdminFeaturesModule { }