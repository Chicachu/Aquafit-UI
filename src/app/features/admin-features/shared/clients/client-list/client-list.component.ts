import { Component, Input, OnInit } from "@angular/core";
import { User } from "../../../../../core/types/user";
import { UserService } from "../../../../../core/services/userService";
import { SnackBarService } from "../../../../../core/services/snackBarService";
import { Router } from "@angular/router";
import { ButtonType } from "../../breadcrumb-nav-bar/breadcrumb-nav-bar.component";
import { Role } from "@core/types/enums/role";
import { EnrollmentService } from "../../../../../core/services/enrollmentService";
import { forkJoin } from "rxjs";

@Component({
  selector: 'app-client-list',
  templateUrl: './client-list.component.html',
  styleUrls: ['./client-list.component.scss']
})
export class ClientListComponent implements OnInit {
  ButtonType = ButtonType
  @Input() title: string = ''
  activeClients: User[] | null = null
  inactiveClients: User[] | null = null

  constructor(
    private usersService: UserService,
    private snackBarService: SnackBarService,
    private router: Router,
    private enrollmentService: EnrollmentService
  ) {}

  ngOnInit(): void {
    // Load clients and active enrollments in parallel
    forkJoin({
      users: this.usersService.getAllUsers(Role.CLIENT),
      activeEnrollments: this.enrollmentService.getAllActiveEnrollments()
    }).subscribe({
      next: ({ users, activeEnrollments }) => {
        // Create a Set of userIds that have active enrollments
        const activeClientIds = new Set<string>(
          activeEnrollments.map((enrollment) => enrollment.userId)
        )

        // Separate clients into active and inactive
        const active: User[] = []
        const inactive: User[] = []

        users.forEach((user: User) => {
          if (activeClientIds.has(user._id)) {
            active.push(user)
          } else {
            inactive.push(user)
          }
        })

        // Sort both lists
        const sortUsers = (a: User, b: User) => {
          if (a.firstName < b.firstName) return -1
          if (b.firstName < a.firstName) return 1
          return 0
        }

        this.activeClients = active.sort(sortUsers)
        this.inactiveClients = inactive.sort(sortUsers)
      },
      error: ({error}) => {
        this.snackBarService.showError(error.message)
      }
    })
  }

  addNewClient(): void {
    this.router.navigate(['/admin/mobile/clients/add-client'])
  }
}