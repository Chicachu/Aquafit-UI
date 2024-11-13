import { NgModule } from "@angular/core";
import { BreadcrumbNavBarComponent } from './breadcrumb-nav-bar/breadcrumb-nav-bar.component'
import { ClientListComponent } from "./clients/client-list/client-list.component";
import { SharedModule } from "../../../shared/shared.module";
import { CommonModule } from "@angular/common";

@NgModule({
  declarations: [
    BreadcrumbNavBarComponent,
    ClientListComponent
  ],
  imports: [
    CommonModule,
    SharedModule
  ],
  exports: [
    BreadcrumbNavBarComponent,
    ClientListComponent
  ]
})
export class SharedAdminFeaturesModule { }