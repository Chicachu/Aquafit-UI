import { Component } from "@angular/core";
import { ButtonType } from "../../breadcrumb-nav-bar/breadcrumb-nav-bar.component";
import { ActivatedRoute } from "@angular/router";
import { UserService } from "@core/services/userService";
import { User } from "@core/types/user";
import { SnackBarService } from "@core/services/snackBarService";

@Component({
  selector: 'app-client-details',
  templateUrl: './client-details.component.html',
  styleUrls: ['./client-details.component.scss']
})
export class ClientDetailsComponent {
  ButtonType = ButtonType
  clientId: string | null = null
  client: User | null = null

  constructor(private route: ActivatedRoute, private userService: UserService, private snackBarService: SnackBarService) {

  }

  ngOnInit(): void {
    const userId = this.route.snapshot.paramMap.get('user-id')
    
    this.userService.getUser(userId!).subscribe({
      next: (user: User) => {
        this.client = user
      },
      error: ({error}) => {
        this.snackBarService.showError(error.message)
      }
    })
  }

  public enrollClient(): void {

  }
}