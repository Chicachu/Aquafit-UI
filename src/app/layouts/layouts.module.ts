import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { SharedModule } from '@shared/shared.module';
import { LayoutGuard } from '@core/guards/layout.guard';
import { authGuard } from '@core/guards/auth.guard';
import { SharedLayoutComponentsModule } from './shared/shared-layout-components.module';
import { MobileShellModule } from './mobile/mobile-shell.module';
import { NavFlyoutModule } from './desktop/nav-flyout.module';
import { AdminLayoutComponent } from '../areas/admin/layouts/admin-shell/admin-layout.component';
import { AdminMobileLayoutComponent } from '../areas/admin/layouts/admin-mobile-layout/admin-mobile-layout.component';
import { AdminDesktopLayoutComponent } from '../areas/admin/layouts/admin-desktop-layout/admin-desktop-layout.component';
import { AuthLayoutComponent } from '../areas/auth/layouts/auth-layout/auth-layout.component';
import { WebsiteLayoutComponent } from '../areas/website/layouts/website-shell/website-layout.component';

const routes = [
  {
    path: '',
    component: AuthLayoutComponent,
    children: [
      {
        path: '',
        loadChildren: () => import('../areas/auth/features/authFeatures.module').then(m => m.AuthFeaturesModule)
      }
    ]
  },
  // Public website: desktop only for now. Mobile/desktop split — see areas/website/website.routes.ts
  {
    path: '',
    component: WebsiteLayoutComponent,
    canActivate: [authGuard],
    children: [
      {
        path: '',
        loadChildren: () => import('../areas/website/features/desktop/website-features.module').then(m => m.WebsiteFeaturesModule)
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
            component: AdminDesktopLayoutComponent,
            loadChildren: () => import('../areas/admin/features/desktop/desktop-features.module').then(m => m.DesktopFeaturesModule)
          },
          {
            path: 'mobile',
            canActivate: [LayoutGuard],
            component: AdminMobileLayoutComponent,
            loadChildren: () => import('../areas/admin/features/mobile/mobile-features.module').then(m => m.MobileFeaturesModule)
          }
        ]
      }
    ]
  }
];

@NgModule({
  declarations: [
    AdminLayoutComponent,
    AdminMobileLayoutComponent,
    AdminDesktopLayoutComponent,
    AuthLayoutComponent,
    WebsiteLayoutComponent
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    SharedModule,
    SharedLayoutComponentsModule,
    MobileShellModule,
    NavFlyoutModule
  ],
  providers: []
})
export class LayoutsModule {}
