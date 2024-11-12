import { NgModule } from "@angular/core";
import { MobileLayoutComponent } from "./mobile/mobile-layout.component";
import { RouterModule, Routes } from "@angular/router";
import { SharedModule } from "../../../shared/shared.module";
import { CommonModule } from "@angular/common";

const navItems = ["NAVIGATION.CALENDAR", "NAVIGATION.CLASSES", "NAVIGATION.CLIENTS"]

const routes: Routes = [
  {
    path: '', 
    loadChildren: () => import('../../../features/admin-features/admin-features.module').then(m => m.AdminFeaturesModule)
  },
  {
    path: 'mobile',
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
