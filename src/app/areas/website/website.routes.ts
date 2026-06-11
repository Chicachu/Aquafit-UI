/**
 * Future public website routing (not active yet).
 *
 * Target shape:
 *   WebsiteShell
 *     ├─ '' + DesktopShell or WebsiteDesktopLayout  →  /home, …
 *     └─ 'mobile' + WebsiteMobileLayout + LayoutGuard  →  /mobile/home, …
 *
 * Example wiring in layouts.module.ts:
 *
 * {
 *   path: '',
 *   component: WebsiteLayoutComponent,
 *   canActivate: [authGuard],
 *   children: [
 *     {
 *       path: '',
 *       canActivate: [LayoutGuard],
 *       children: [
 *         {
 *           path: '',
 *           component: WebsiteDesktopLayoutComponent,
 *           loadChildren: () =>
 *             import('./features/desktop/website-features.module').then(m => m.WebsiteFeaturesModule)
 *         },
 *         {
 *           path: 'mobile',
 *           component: WebsiteMobileLayoutComponent,
 *           loadChildren: () =>
 *             import('./features/mobile/website-mobile-features.module').then(m => m.WebsiteMobileFeaturesModule)
 *         }
 *       ]
 *     }
 *   ]
 * }
 */

export {};
