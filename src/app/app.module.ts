import { NgModule } from "@angular/core"
import { AppComponent } from "./app.component"
import { TranslatePipe } from '@ngx-translate/core'
import { FeaturesModule } from "./features/features.module"
import { LayoutsModule } from "./layouts/layouts.module"
import { BrowserModule } from "@angular/platform-browser"
import { RouterModule } from "@angular/router"
import { SharedModule } from "./shared/shared.module"

export const routes = [
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
    FeaturesModule,
    LayoutsModule,
    SharedModule
  ],
  providers: [
    TranslatePipe,
  ],
})
export class AppModule { }