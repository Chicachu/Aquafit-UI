import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { MobileHomeComponent } from "./home/mobile-home.component";
import { SharedAdminFeaturesModule } from "../shared/shared-admin-features.module";
import { CommonModule } from "@angular/common";
import { OverviewComponent } from "../shared/overview/overview.component";

const routes: Routes = [
  {
    path: 'home', component: MobileHomeComponent
  },
  {
    path: 'classes', 
    data: { newItemButtonText: 'Create New Class' },
    component: OverviewComponent
  }
]

@NgModule({
  declarations: [
    MobileHomeComponent
  ],
  imports: [
    CommonModule,
    SharedAdminFeaturesModule,
    RouterModule.forChild(routes)
  ],
  exports: [
  ]
})
export class MobileFeaturesModule { }