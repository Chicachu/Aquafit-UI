import { Component, Input } from "@angular/core";
import { User } from "../../../../../core/types/user";
import { UserService } from "../../../../../core/services/userService";
import { SnackBarService } from "../../../../../core/services/snackBarService";
import { Router } from "@angular/router";
import { ButtonType } from "../../breadcrumb-nav-bar/breadcrumb-nav-bar.component";

@Component({
  selector: 'app-client-list',
  templateUrl: './client-list.component.html',
  styleUrls: ['./client-list.component.scss']
})
export class ClientListComponent {
  ButtonType = ButtonType
  @Input() title: string = ''
  users: User[] | null = null

  constructor(
    private usersService: UserService,
    private snackBarService: SnackBarService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.usersService.getAllUsers().subscribe({
      next: (users: User[]) => {
        this.users = users
        this.users.sort((a: User, b: User) => {
          if (a.firstName < b.firstName) return -1
          if (b.firstName < a.firstName) return 1
          if (a.firstName === b.firstName) return 0

          return 0
        })
      }, 
      error: ({error}) => {
        this.snackBarService.showError(error.message)
      }
    })
  }

  addNewClient(): void {
    this.router.navigate(['/admin/mobile/clients/new-client'])
  }
}