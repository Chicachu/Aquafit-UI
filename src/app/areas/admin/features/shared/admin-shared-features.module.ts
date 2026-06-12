import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { MatRadioModule } from '@angular/material/radio';
import { TranslateModule } from '@ngx-translate/core';
import { SharedModule } from '@shared/shared.module';
import { BreadcrumbNavBarComponent } from '../mobile/breadcrumb-nav-bar/breadcrumb-nav-bar.component';
import { ClassListComponent } from '../mobile/classes/class-list/class-list.component';
import { ClassDetailsComponent } from '../mobile/classes/class-details/class-details.component';
import { EditClassComponent } from '../mobile/classes/edit-class/edit-class.component';
import { ClassEnrollComponent } from '../mobile/classes/class-enroll/class-enroll.component';
import { InvoiceDetailsComponent } from '../mobile/payments/invoice-details/invoice-details.component';
import { InvoiceHistoryComponent } from '../mobile/payments/invoice-history/invoice-history.component';
import { ClientListComponent } from '../mobile/clients/client-list/client-list.component';
import { ClientDetailsComponent } from '../mobile/clients/client-details/client-details.component';
import { EditClientComponent } from '../mobile/clients/edit-client/edit-client.component';
import { EmployeesListComponent } from '../mobile/employees/employees-list/employees-list.component';
import { EmployeeDetailsComponent } from '../mobile/employees/employee-details/employee-details.component';
import { EmployeePaymentOverviewComponent } from '../mobile/employees/employee-payment-overview/employee-payment-overview.component';
import { EmployeePayableDetailsComponent } from '../mobile/employees/employee-payable-details/employee-payable-details.component';
import { AddEmployeeComponent } from '../mobile/employees/add-employee/add-employee.component';
import { EditEmployeeComponent } from '../mobile/employees/edit-employee/edit-employee.component';
import { EmployeeAssignClassComponent } from '../mobile/employees/employee-assign-class/employee-assign-class.component';

@NgModule({
  declarations: [
    BreadcrumbNavBarComponent,
    ClassListComponent,
    ClassDetailsComponent,
    EditClassComponent,
    ClassEnrollComponent,
    InvoiceDetailsComponent,
    InvoiceHistoryComponent,
    ClientListComponent,
    ClientDetailsComponent,
    EditClientComponent,
    EmployeesListComponent,
    EmployeeDetailsComponent,
    EmployeePaymentOverviewComponent,
    EmployeePayableDetailsComponent,
    AddEmployeeComponent,
    EditEmployeeComponent,
    EmployeeAssignClassComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    TranslateModule,
    MatRadioModule,
    SharedModule
  ],
  exports: [
    BreadcrumbNavBarComponent,
    ClassListComponent,
    ClassDetailsComponent,
    EditClassComponent,
    ClassEnrollComponent,
    InvoiceDetailsComponent,
    InvoiceHistoryComponent,
    ClientListComponent,
    ClientDetailsComponent,
    EditClientComponent,
    EmployeesListComponent,
    EmployeeDetailsComponent,
    EmployeePaymentOverviewComponent,
    EmployeePayableDetailsComponent,
    AddEmployeeComponent,
    EditEmployeeComponent,
    EmployeeAssignClassComponent
  ]
})
export class AdminSharedFeaturesModule {}
