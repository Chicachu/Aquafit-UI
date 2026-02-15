import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { RouterModule, Routes } from "@angular/router";
import { SharedModule } from "@shared/shared.module";
import { DesktopHomeComponent } from "./desktop-home/desktop-home.component";

const routes: Routes = [
  {
    path: 'home',
    component: DesktopHomeComponent
  },
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'home'
  }
];

@NgModule({
  declarations: [
    DesktopHomeComponent
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    SharedModule
  ],
  providers: []
})
export class DesktopFeaturesModule {}
