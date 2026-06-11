import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { SharedModule } from '@shared/shared.module';
import { TopHeaderComponent } from './header/top-header/top-header.component';
import { WebsiteHeaderComponent } from './header/website-header/website-header.component';

@NgModule({
  declarations: [
    WebsiteHeaderComponent,
    TopHeaderComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
    RouterModule
  ],
  exports: [
    WebsiteHeaderComponent,
    TopHeaderComponent
  ]
})
export class SharedLayoutComponentsModule {}
