import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { SharedModule } from "../../shared/shared.module";
import { WebsiteHeaderComponent } from "./header/website-header/website-header.component";
import { RouterModule } from "@angular/router";
import { TopHeaderComponent } from "./header/top-header/top-header.component";
import { AdminHeaderComponent } from "./header/admin-header/admin-header.component";

@NgModule({
  declarations: [
    AdminHeaderComponent,
    WebsiteHeaderComponent,
    TopHeaderComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
    RouterModule
  ],
  exports: [
    AdminHeaderComponent,
    WebsiteHeaderComponent,
    TopHeaderComponent
  ],
  providers: []
})
export class LayoutComponentsModule { }