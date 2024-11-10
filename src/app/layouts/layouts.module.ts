import { NgModule } from "@angular/core"
import { AuthLayoutComponent } from "./auth-layout/auth-layout.component";
import { CommonModule } from "@angular/common";
import { RouterModule } from "@angular/router";
import { SharedModule } from "../shared/shared.module";

const routes = [
  {
    path: '',
    component: AuthLayoutComponent,
    children: [
      {
        path: '', 
        loadChildren: () => import('../features/authFeatures/authFeatures.module').then(m => m.AuthFeaturesModule), // Lazy load AuthModule
      },
    ],
  },
];

@NgModule({
  declarations: [
    AuthLayoutComponent
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    SharedModule
  ],
  providers: []
})
export class LayoutsModule { }