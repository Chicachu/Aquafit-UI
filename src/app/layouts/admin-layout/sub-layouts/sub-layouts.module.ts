import { NgModule } from "@angular/core";
import { MobileLayoutComponent } from "./mobile/mobile-layout.component";
import { RouterModule, Routes } from "@angular/router";
import { SharedModule } from "../../../shared/shared.module";
import { CommonModule } from "@angular/common";
import { LayoutGuard } from "../../../core/guards/layout.guard";
import { ReactiveFormsModule } from "@angular/forms";

const navItems = new Map([
  ["NAVIGATION.CALENDAR", "/admin/mobile/home"],
  ["NAVIGATION.CLIENTS", "/admin/mobile/clients"],
  ["NAVIGATION.EMPLOYEES", "/admin/mobile/employees"],
  ["NAVIGATION.CLASSES", "/admin/mobile/classes"],
  ["NAVIGATION.CHECK_INS", "/admin/mobile/check-ins"],
  ["NAVIGATION.DISCOUNTS", "/admin/mobile/discounts"],
  ["NAVIGATION.SALARY_CONFIGURATION", "/admin/mobile/salary-configuration"]
])

const routes: Routes = [
  {
    path: '', 
    loadChildren: () => import('../../../features/admin-features/admin-features.module').then(m => m.AdminFeaturesModule)
  },
  {
    path: 'mobile',
    canActivate: [LayoutGuard],
    component: MobileLayoutComponent,
    data: { navItems },
    loadChildren: () => import('../../../features/admin-features/mobile/mobile-features.module').then(m => m.MobileFeaturesModule)
  }
]

@NgModule({
  declarations: [
    MobileLayoutComponent
  ],
  imports: [
    CommonModule, 
    RouterModule.forChild(routes),
    SharedModule
  ]
})
export class SubLayoutsModule { }
