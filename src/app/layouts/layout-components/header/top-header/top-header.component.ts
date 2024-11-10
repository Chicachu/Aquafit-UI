import { Component } from "@angular/core";
import { UserService } from "../../../../core/services/userService";

@Component({
  selector: 'app-top-header',
  templateUrl: './top-header.component.html',
  styleUrls: ['./top-header.component.scss']
})
export class TopHeaderComponent {
  loggedIn = false

  constructor(private userService: UserService) {}

  ngOnInit(): void {
    this.loggedIn = this.userService.isUserLoggedIn
  }
}