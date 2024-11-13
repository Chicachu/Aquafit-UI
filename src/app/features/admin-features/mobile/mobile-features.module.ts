import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { MobileHomeComponent } from "./home/mobile-home.component";
import { SharedAdminFeaturesModule } from "../shared/shared-admin-features.module";
import { CommonModule } from "@angular/common";
import { SharedModule } from "../../../shared/shared.module";
import { ClientListComponent } from "../shared/clients/client-list/client-list.component";
import { EditClientComponent } from "../shared/clients/edit-client/edit-client.component";

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