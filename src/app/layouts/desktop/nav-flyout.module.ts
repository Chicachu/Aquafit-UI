import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { SharedModule } from '@shared/shared.module';
import { NavFlyoutComponent } from './nav-flyout/nav-flyout.component';

@NgModule({
  declarations: [
    NavFlyoutComponent
  ],
  imports: [
    CommonModule,
    SharedModule
  ],
  exports: [
    NavFlyoutComponent
  ]
})
export class NavFlyoutModule {}
