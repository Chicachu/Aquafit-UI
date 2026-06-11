import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { RouterModule, Routes } from "@angular/router";
import { SharedModule } from "@shared/shared.module";
import { InstructorOrAdminGuard } from "@core/guards/instructor-or-admin.guard";
import { AdminSharedFeaturesModule } from "../shared/admin-shared-features.module";
import { DesktopHomeComponent } from "./desktop-home/desktop-home.component";
import { DesktopClassCalendarComponent } from "./desktop-calendar/desktop-class-calendar.component";
import { ClassesDesktopPageComponent } from "./classes-desktop-page/classes-desktop-page.component";
import { ClassDetailsComponent } from "../mobile/classes/class-details/class-details.component";

const routes: Routes = [
  {
    path: 'home',
    component: DesktopHomeComponent
  },
  {
    path: 'classes',
    component: ClassesDesktopPageComponent,
    canActivate: [InstructorOrAdminGuard]
  },
  {
    path: 'classes/:class-id/details',
    component: ClassesDesktopPageComponent,
    canActivate: [InstructorOrAdminGuard],
    children: [
      {
        path: '',
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
