import { NgModule } from "@angular/core";
import { AdminHomeComponent } from "./home/admin-home.component";
import { RouterModule } from "@angular/router";
import { LayoutGuard } from "../../core/guards/layout.guard";

const routes = [
  { 
    path: 'home', component: AdminHomeComponent
  },
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