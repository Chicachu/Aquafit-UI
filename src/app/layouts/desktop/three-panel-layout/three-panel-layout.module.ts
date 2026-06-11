import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ThreePanelLayoutComponent } from './three-panel-layout.component';

@NgModule({
  declarations: [
    ThreePanelLayoutComponent
  ],
  imports: [
    CommonModule,
    RouterModule
  ],
  exports: [
    ThreePanelLayoutComponent
  ]
})
export class ThreePanelLayoutModule {}
