import { NgModule } from "@angular/core"
import { AppComponent } from "./app.component"
import { TranslatePipe } from '@ngx-translate/core'
import { LayoutsModule } from "./layouts/layouts.module"
import { BrowserModule } from "@angular/platform-browser"
import { RouterModule, Routes } from "@angular/router"
import { SharedModule } from "./shared/shared.module"
import { registerLocaleData } from '@angular/common';
import localeEs from '@angular/common/locales/es';
import localeEn from '@angular/common/locales/en';

registerLocaleData(localeEs, 'es');
registerLocaleData(localeEn, 'en');

export const routes: Routes = [
  { 
    path: '', 
    redirectTo: '/login', 
    pathMatch: 'full',
  },
  {
    path: '',
    component: AppComponent,
    children: [
      {
        path: '', 
        loadChildren: () => import('./layouts/layouts.module').then(m => m.LayoutsModule),
      },
    ],
  }
]

@NgModule({
  declarations: [
  ],
  imports: [
    BrowserModule,
    RouterModule,
    LayoutsModule,
    SharedModule
  ],
  providers: [
    TranslatePipe
  ],
})
export class AppModule { }