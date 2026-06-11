import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { SharedModule } from '@shared/shared.module';
import { MobileShellComponent } from './mobile-shell/mobile-shell.component';

@NgModule({
  declarations: [
    MobileShellComponent
  ],
  imports: [
    CommonModule,
    RouterModule,
    SharedModule
  ],
  exports: [
    MobileShellComponent
  ]
})
export class MobileShellModule {}
