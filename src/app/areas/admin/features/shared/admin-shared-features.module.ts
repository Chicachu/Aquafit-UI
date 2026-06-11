import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { MatRadioModule } from '@angular/material/radio';
import { TranslateModule } from '@ngx-translate/core';
import { SharedModule } from '@shared/shared.module';
import { BreadcrumbNavBarComponent } from '../mobile/breadcrumb-nav-bar/breadcrumb-nav-bar.component';
import { ClassListComponent } from '../mobile/classes/class-list/class-list.component';
import { ClassDetailsComponent } from '../mobile/classes/class-details/class-details.component';

@NgModule({
  declarations: [
    BreadcrumbNavBarComponent,
    ClassListComponent,
    ClassDetailsComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    TranslateModule,
    MatRadioModule,
    SharedModule
  ],
  exports: [
    BreadcrumbNavBarComponent,
    ClassListComponent,
    ClassDetailsComponent
  ]
})
export class AdminSharedFeaturesModule {}
