import { NgModule } from "@angular/core";
import { AuthFeaturesModule } from "./authFeatures/authFeatures.module";
import { SharedModule } from "../shared/shared.module";

@NgModule({
  declarations: [
  ],
  imports: [
    AuthFeaturesModule,
  ],
  providers: []
})
export class FeaturesModule { }