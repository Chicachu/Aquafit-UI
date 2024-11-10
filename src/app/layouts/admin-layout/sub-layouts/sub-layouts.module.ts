import { NgModule } from "@angular/core";
import { MobileLayoutComponent } from "./mobile/mobile-layout.component";
import { RouterModule, Routes } from "@angular/router";

const routes: Routes = [
  {
    path: '', 
    loadChildren: () => import('../../../features/admin-features/admin-features.module').then(m => m.AdminFeaturesModule)
  },
  {
    path: 'mobile',
    loadChildren: () => import('../../../features/admin-features/mobile/mobile-features.module').then(m => m.MobileFeaturesModule)
  }
]

@NgModule({
  declarations: [
    MobileLayoutComponent
  ],
  imports: [
    RouterModule.forChild(routes)
  ]
})
export class SubLayoutsModule { }
