import { NgModule } from "@angular/core"
import { AuthLayoutComponent } from "./auth-layout/auth-layout.component";
import { CommonModule } from "@angular/common";
import { RouterModule } from "@angular/router";
import { SharedModule } from "../shared/shared.module";
import { WebsiteLayoutComponent } from "./website-layout/website-layout.component";
import { LayoutComponentsModule } from "./layout-components/layout-components.module";
import { AdminLayoutComponent } from "./admin-layout/admin-layout.component";
import { SubLayoutsModule } from "./admin-layout/sub-layouts/sub-layouts.module";
import { LayoutGuard } from "../core/guards/layout.guard";

const routes = [
  {
    path: '',
    component: AuthLayoutComponent,
    children: [
      {
        path: '', 
        loadChildren: () => import('../features/authFeatures/authFeatures.module').then(m => m.AuthFeaturesModule)
      },
    ],
  },
  {
    path: '', 
    component: WebsiteLayoutComponent,
    children: [
      {
        path: '',
        loadChildren: () => import('../features/website-features/website-features.module').then(m => m.WebsiteFeaturesModule)
      }
    ]
  },
  {
    path: '',
    component: AdminLayoutComponent,
    children: [
      {
        path: 'admin',
        canActivate: [LayoutGuard],
        loadChildren: () => import('./admin-layout/sub-layouts/sub-layouts.module').then(m => m.SubLayoutsModule)
      }
    ]
  }
];

@NgModule({
  declarations: [
    AdminLayoutComponent,
    AuthLayoutComponent,
    WebsiteLayoutComponent
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    SharedModule, 
    LayoutComponentsModule,
    SubLayoutsModule
  ],
  providers: []
})
export class LayoutsModule { }