import { Component } from "@angular/core";
import { Router } from "@angular/router";
import { UserService } from "../../../../core/services/userService";

@Component({
  selector: 'app-top-header',
  templateUrl: './top-header.component.html',
  styleUrls: ['./top-header.component.scss']
})
export class TopHeaderComponent {
  get loggedIn(): boolean {
    return this.userService.isUserLoggedIn;
  }

  constructor(
    private userService: UserService,
    private router: Router
  ) {}

  logout(): void {
    this.userService.clearSession();
    this.router.navigate(['/login']);
  }
}