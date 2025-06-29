import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
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
    path: 'clients/:user-id/details',
    pathMatch: 'full', 
    component: ClientDetailsComponent
  },
  {
    path: 'clients/add-client', 
    pathMatch: 'full',
    component: EditClientComponent
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
    path: 'classes', 
    pathMatch: 'full', 
    component: ClassListComponent
  },
  {
    path: 'classes/:class-id/details', 
    pathMatch: 'full', 
    component: ClassDetailsComponent 
  },
  {
    path: 'classes/add-class',
    pathMatch: 'full',
    component: EditClassComponent
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