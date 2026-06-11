import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SharedModule } from '@shared/shared.module';
import { WebsiteMobileHomeComponent } from './home/website-mobile-home.component';

const routes: Routes = [
  {
    path: 'home',
    component: WebsiteMobileHomeComponent
  },
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'home'
  }
];

/** Lazy-load this module under WebsiteMobileLayout when /mobile routes are enabled. */
@NgModule({
  declarations: [
    WebsiteMobileHomeComponent
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    SharedModule
  ]
})
export class WebsiteMobileFeaturesModule {}
