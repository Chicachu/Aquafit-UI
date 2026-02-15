import { NgModule } from "@angular/core"
import { AuthLayoutComponent } from "./auth-layout/auth-layout.component";
import { CommonModule } from "@angular/common";
import { RouterModule } from "@angular/router";
import { SharedModule } from "../shared/shared.module";
import { WebsiteLayoutComponent } from "./website-layout/website-layout.component";
import { LayoutComponentsModule } from "./layout-components/layout-components.module";
import { MobileLayoutComponent } from "./mobile-layout/mobile-layout.component";
import { LayoutGuard } from "../core/guards/layout.guard";
import { authGuard } from "../core/guards/auth.guard";
import { AdminLayoutComponent } from "./admin-layout/admin-layout.component";

const adminNavItems = new Map([
  ["NAVIGATION.CALENDAR", "/admin/mobile/home"],
  ["NAVIGATION.CLIENTS", "/admin/mobile/clients"],
  ["NAVIGATION.EMPLOYEES", "/admin/mobile/employees"],
  ["NAVIGATION.CLASSES", "/admin/mobile/classes"],
  ["NAVIGATION.CHECK_INS", "/admin/mobile/check-ins"],
  ["NAVIGATION.DISCOUNTS", "/admin/mobile/discounts"],
  ["NAVIGATION.SALARY_CONFIGURATION", "/admin/mobile/salary-configuration"]
])

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
    canActivate: [authGuard],
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
    canActivate: [authGuard],
    children: [
      {
        path: 'admin',
        canActivate: [LayoutGuard],
        children: [
          {
            path: '',
            loadChildren: () => import('../features/desktop-features/desktop-features.module').then(m => m.DesktopFeaturesModule)
          },
          {
            path: 'mobile',
            canActivate: [LayoutGuard],
            component: MobileLayoutComponent,
            data: { navItems: adminNavItems },
            loadChildren: () => import('../features/mobile-features/mobile-features.module').then(m => m.MobileFeaturesModule)
          }
        ]
      }
    ]
  }
];

@NgModule({
  declarations: [
    AdminLayoutComponent,
    AuthLayoutComponent,
    WebsiteLayoutComponent,
    MobileLayoutComponent
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    SharedModule,
    LayoutComponentsModule
  ],
  providers: []
})
export class LayoutsModule { }
