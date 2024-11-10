import { NgModule } from "@angular/core";
import { EnrollComponent } from "./enroll/enroll.component";
import { LoginComponent } from "./login/login.component";
import { RegisterComponent } from "./register/register.component";
import { CommonModule } from "@angular/common";
import { RouterModule } from "@angular/router";
import { SharedModule } from "../../shared/shared.module";

const routes = [
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'enroll', component: EnrollComponent }
]

@NgModule({
  declarations: [
    EnrollComponent,
    LoginComponent, 
    RegisterComponent
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    SharedModule
  ],
  providers: []
})
export class AuthFeaturesModule { }