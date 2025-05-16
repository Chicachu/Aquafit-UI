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

@NgModule({
  declarations: [
    BreadcrumbNavBarComponent,
    EditClientComponent,
    EditClassComponent, 
    ClientListComponent,
    ClientDetailsComponent,
    ClassListComponent,
    ClassDetailsComponent,
    MobileCalendarComponent
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