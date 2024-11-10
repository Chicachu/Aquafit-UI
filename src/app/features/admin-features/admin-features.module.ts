import { NgModule } from "@angular/core";
import { AdminHomeComponent } from "./home/admin-home.component";
import { RouterModule } from "@angular/router";

const routes = [
  { path: 'home', component: AdminHomeComponent },
]

@NgModule({
  declarations: [
    AdminHomeComponent
  ],
  imports: [
    RouterModule.forChild(routes),
  ],
  providers: []
})
export class AdminFeaturesModule { }