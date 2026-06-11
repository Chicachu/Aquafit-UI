import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { RouterModule, Routes } from "@angular/router";
import { SharedModule } from "@shared/shared.module";
import { AdminGuard } from "@core/guards/admin.guard";
import { InstructorOrAdminGuard } from "@core/guards/instructor-or-admin.guard";
import { AdminSharedFeaturesModule } from "../shared/admin-shared-features.module";
import { DesktopHomeComponent } from "./desktop-home/desktop-home.component";
import { DesktopClassCalendarComponent } from "./desktop-calendar/desktop-class-calendar.component";
import { ClassesDesktopPageComponent } from "./classes-desktop-page/classes-desktop-page.component";
import { ClassDetailsComponent } from "../mobile/classes/class-details/class-details.component";
import { EditClassComponent } from "../mobile/classes/edit-class/edit-class.component";
const routes: Routes = [
  {
    path: 'home',
    component: DesktopHomeComponent
  },
  {
    path: 'classes',
    component: ClassesDesktopPageComponent,
    canActivate: [InstructorOrAdminGuard],
    children: [
      {
        path: 'add-class',
        component: EditClassComponent,
        canActivate: [AdminGuard],
        data: { panelView: true }
      },
      {
        path: ':class-id/details/enroll',
        component: ClassDetailsComponent,
        data: { panelView: true, showEnrollPanel: true }
      },
      {
        path: ':class-id/details/invoice/:user-id/:enrollment-id/:invoice-id',
        component: ClassDetailsComponent,
        data: { panelView: true, showInvoiceDetailsPanel: true }
      },
      {
        path: ':class-id/details/invoice/:user-id/:enrollment-id',
        component: ClassDetailsComponent,
        data: { panelView: true, showInvoiceHistoryPanel: true }
      },
      {
        path: ':class-id/details',
        component: ClassDetailsComponent,
        data: { panelView: true }
      }
    ]
  },
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'home'
  }
];

@NgModule({
  declarations: [
    DesktopHomeComponent,
    DesktopClassCalendarComponent,
    ClassesDesktopPageComponent
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    SharedModule,
    AdminSharedFeaturesModule
  ],
  providers: []
})
export class DesktopFeaturesModule {}
