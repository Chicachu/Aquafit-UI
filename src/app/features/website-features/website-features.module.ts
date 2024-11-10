import { CommonModule } from "@angular/common";
import { HomeComponent } from "./home/home.component";
import { RouterModule } from "@angular/router";
import { SharedModule } from "../../shared/shared.module";
import { NgModule } from "@angular/core";

const routes = [
  { path: 'home', component: HomeComponent },
]

@NgModule({
  declarations: [
    HomeComponent,
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    SharedModule
  ],
  providers: []
})
export class WebsiteFeaturesModule { }