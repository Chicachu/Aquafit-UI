import { NgModule } from "@angular/core";
import { AuthFeaturesModule } from "./authFeatures/authFeatures.module";
import { RouterModule } from "@angular/router";

@NgModule({
  declarations: [
  ],
  imports: [
    AuthFeaturesModule,
    RouterModule
  ],
  providers: []
})
export class FeaturesModule { }