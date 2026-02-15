import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { ReactiveFormsModule } from "@angular/forms";
import { MatRadioModule } from "@angular/material/radio";
import { TranslateModule } from "@ngx-translate/core";
import { AdminGuard } from "@core/guards/admin.guard";
import { TimeTrackingGuard } from "@core/guards/time-tracking.guard";
import { StaffGuard } from "@core/guards/staff.guard";
import { InstructorOrAdminGuard } from "@core/guards/instructor-or-admin.guard";
import { PaymentOverviewGuard } from "@core/guards/payment-overview.guard";
import { MobileHomeComponent } from "./home/mobile-home.component";
import { CommonModule } from "@angular/common";
import { SharedModule } from "@shared/shared.module";
import { BreadcrumbNavBarComponent } from "./breadcrumb-nav-bar/breadcrumb-nav-bar.component";
import { ClientListComponent } from "./clients/client-list/client-list.component";
import { EditClientComponent } from "./clients/edit-client/edit-client.component";
import { ClassListComponent } from "./classes/class-list/class-list.component";
import { EditClassComponent } from "./classes/edit-class/edit-class.component";
import { ClassDetailsComponent } from "./classes/class-details/class-details.component";
import { ClientDetailsComponent } from "./clients/client-details/client-details.component";
import { InvoiceHistoryComponent } from "./payments/invoice-history/invoice-history.component";
import { InvoiceDetailsComponent } from "./payments/invoice-details/invoice-details.component";
import { DiscountListComponent } from "./discounts/discount-list/discount-list.component";
import { DiscountDetailsComponent } from "./discounts/discount-details/discount-details.component";
import { EditDiscountComponent } from "./discounts/edit-discount/edit-discount.component";
import { EmployeeDetailsComponent } from "./employees/employee-details/employee-details.component";
import { EmployeePaymentOverviewComponent } from "./employees/employee-payment-overview/employee-payment-overview.component";
import { EmployeePayableDetailsComponent } from "./employees/employee-payable-details/employee-payable-details.component";
import { EmployeesListComponent } from "./employees/employees-list/employees-list.component";
import { AddEmployeeComponent } from "./employees/add-employee/add-employee.component";
import { EditEmployeeComponent } from "./employees/edit-employee/edit-employee.component";
import { SalaryConfigurationComponent } from "./salary-configuration/salary-configuration.component";
import { CheckInsComponent } from "./check-ins/check-ins.component";
import { MobileClassCalendarComponent } from "./mobile-calendar/mobile-calendar.component";

const routes: Routes = [
  {
    path: 'home',
    pathMatch: 'full',
    component: MobileHomeComponent,
    canActivate: [InstructorOrAdminGuard]
  },
  {
    path: 'clients',
    pathMatch: 'full',
    component: ClientListComponent,
    canActivate: [InstructorOrAdminGuard]
  },
  {
    path: 'clients/add-client',
    pathMatch: 'full',
    component: EditClientComponent,
    canActivate: [InstructorOrAdminGuard]
  },
  {
    path: 'clients/:user-id/details',
    pathMatch: 'full',
    component: ClientDetailsComponent,
    canActivate: [InstructorOrAdminGuard]
  },
  {
    path: 'clients/:user-id/edit',
    pathMatch: 'full',
    component: EditClientComponent,
    canActivate: [AdminGuard]
  },
  {
    path: 'clients/:user-id/payments/:enrollment-id',
    pathMatch: 'full',
    component: InvoiceHistoryComponent,
    canActivate: [InstructorOrAdminGuard]
  },
  {
    path: 'clients/:user-id/payments/:enrollment-id/:invoice-id',
    pathMatch: 'full',
    component: InvoiceDetailsComponent,
    canActivate: [InstructorOrAdminGuard]
  },
  {
    path: 'employees',
    pathMatch: 'full',
    component: EmployeesListComponent,
    canActivate: [AdminGuard]
  },
  {
    path: 'employees/add',
    pathMatch: 'full',
    component: AddEmployeeComponent,
    canActivate: [AdminGuard]
  },
  {
    path: 'employees/:user-id/details',
    pathMatch: 'full',
    component: EmployeeDetailsComponent
  },
  {
    path: 'employees/:user-id/edit',
    pathMatch: 'full',
    component: EditEmployeeComponent,
    canActivate: [AdminGuard]
  },
  {
    path: 'employees/:user-id/payments',
    pathMatch: 'full',
    component: EmployeePaymentOverviewComponent,
    canActivate: [PaymentOverviewGuard]
  },
  {
    path: 'employees/:user-id/payments/details/:payable-id',
    pathMatch: 'full',
    component: EmployeePayableDetailsComponent,
    canActivate: [PaymentOverviewGuard]
  },
  {
    path: 'classes',
    pathMatch: 'full',
    component: ClassListComponent,
    canActivate: [InstructorOrAdminGuard]
  },
  {
    path: 'classes/add-class',
    pathMatch: 'full',
    component: EditClassComponent,
    canActivate: [InstructorOrAdminGuard]
  },
  {
    path: 'classes/:class-id/details',
    pathMatch: 'full',
    component: ClassDetailsComponent,
    canActivate: [InstructorOrAdminGuard]
  },
  {
    path: 'classes/:class-id/edit',
    pathMatch: 'full',
    component: EditClassComponent,
    canActivate: [AdminGuard]
  },
  {
    path: 'discounts',
    pathMatch: 'full',
    component: DiscountListComponent,
    canActivate: [AdminGuard]
  },
  {
    path: 'discounts/add-discount',
    pathMatch: 'full',
    component: EditDiscountComponent,
    canActivate: [AdminGuard]
  },
  {
    path: 'discounts/:discount-id/details',
    pathMatch: 'full',
    component: DiscountDetailsComponent,
    canActivate: [AdminGuard]
  },
  {
    path: 'discounts/:discount-id/edit',
    pathMatch: 'full',
    component: EditDiscountComponent,
    canActivate: [AdminGuard]
  },
  {
    path: 'salary-configuration',
    pathMatch: 'full',
    component: SalaryConfigurationComponent,
    canActivate: [AdminGuard]
  },
  {
    path: 'check-ins',
    pathMatch: 'full',
    component: CheckInsComponent,
    canActivate: [TimeTrackingGuard]
  }
]

@NgModule({
  declarations: [
    MobileHomeComponent,
    MobileClassCalendarComponent,
    BreadcrumbNavBarComponent,
    EditClientComponent,
    EditClassComponent,
    ClientListComponent,
    ClientDetailsComponent,
    ClassListComponent,
    ClassDetailsComponent,
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
    ReactiveFormsModule,
    SharedModule,
    TranslateModule,
    MatRadioModule,
    RouterModule.forChild(routes)
  ],
  exports: [
  ]
})
export class MobileFeaturesModule { }
