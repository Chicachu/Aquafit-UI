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

@NgModule({
  declarations: [
    BreadcrumbNavBarComponent,
    ClassListComponent,
    ClassDetailsComponent,
    EditClassComponent,
    ClassEnrollComponent,
    InvoiceDetailsComponent,
    InvoiceHistoryComponent
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
    InvoiceHistoryComponent
  ]
})
export class AdminSharedFeaturesModule {}
