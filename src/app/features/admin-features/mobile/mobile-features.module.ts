import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { AdminGuard } from "@core/guards/admin.guard";
import { MobileHomeComponent } from "./home/mobile-home.component";
import { SharedAdminFeaturesModule } from "../shared/shared-admin-features.module";
import { CommonModule } from "@angular/common";
import { SharedModule } from "../../../shared/shared.module";
import { ClientListComponent } from "../shared/clients/client-list/client-list.component";
import { EditClientComponent } from "../shared/clients/edit-client/edit-client.component";
import { ClassListComponent } from "../shared/classes/class-list/class-list.component";
import { EditClassComponent } from "../shared/classes/edit-class/edit-class.component";
import { ClassDetailsComponent } from "../shared/classes/class-details/class-details.component";
import { ClientDetailsComponent } from "../shared/clients/client-details/client-details.component";
import { InvoiceHistoryComponent } from "../shared/payments/invoice-history/invoice-history.component";
import { InvoiceDetailsComponent } from "../shared/payments/invoice-details/invoice-details.component";
import { DiscountListComponent } from "../shared/discounts/discount-list/discount-list.component";
import { DiscountDetailsComponent } from "../shared/discounts/discount-details/discount-details.component";
import { EditDiscountComponent } from "../shared/discounts/edit-discount/edit-discount.component";
import { InstructorsDetailsComponent } from "../shared/instructors/instructors-details/instructors-details.component";
import { InstructorPaymentOverviewComponent } from "../shared/instructors/instructor-payment-overview/instructor-payment-overview.component";
import { EmployeeDetailsComponent } from "../shared/employees/employee-details/employee-details.component";
import { EmployeesListComponent } from "../shared/employees/employees-list/employees-list.component";
import { AddEmployeeComponent } from "../shared/employees/add-employee/add-employee.component";
import { EditEmployeeComponent } from "../shared/employees/edit-employee/edit-employee.component";
import { SalaryConfigurationComponent } from "../shared/salary-configuration/salary-configuration.component";

const routes: Routes = [
  {
    path: 'home',
    pathMatch: 'full',
    component: MobileHomeComponent
  },
  {
    path: 'clients', 
    pathMatch: 'full',
    component: ClientListComponent
  },
  {
    path: 'clients/add-client', 
    pathMatch: 'full',
    component: EditClientComponent
  },
  {
    path: 'clients/:user-id/details',
    pathMatch: 'full', 
    component: ClientDetailsComponent
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
    component: InvoiceHistoryComponent
  },
  {
    path: 'clients/:user-id/payments/:enrollment-id/:invoice-id',
    pathMatch: 'full', 
    component: InvoiceDetailsComponent
  },
  {
    path: 'instructors/:user-id/details',
    pathMatch: 'full', 
    component: InstructorsDetailsComponent
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
    path: 'instructors/:user-id/edit',
    pathMatch: 'full',
    component: EditEmployeeComponent,
    canActivate: [AdminGuard]
  },
  {
    path: 'instructors/:user-id/payments',
    pathMatch: 'full',
    component: InstructorPaymentOverviewComponent
  },
  {
    path: 'classes', 
    pathMatch: 'full', 
    component: ClassListComponent
  },
  {
    path: 'classes/add-class',
    pathMatch: 'full',
    component: EditClassComponent
  },
  {
    path: 'classes/:class-id/details', 
    pathMatch: 'full', 
    component: ClassDetailsComponent 
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
  }
]

@NgModule({
  declarations: [
    MobileHomeComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
    SharedAdminFeaturesModule,
    RouterModule.forChild(routes)
  ],
  exports: [
  ]
})
export class MobileFeaturesModule { }