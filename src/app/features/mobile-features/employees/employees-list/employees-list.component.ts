import { Component, OnInit } from "@angular/core";
import { User } from "@core/types/user";
import { UserService } from "@core/services/userService";
import { SnackBarService } from "@core/services/snackBarService";
import { ButtonType } from "../../breadcrumb-nav-bar/breadcrumb-nav-bar.component";
import { Role } from "@core/types/enums/role";
import { Router } from "@angular/router";

@Component({
  selector: 'app-employees-list',
  templateUrl: './employees-list.component.html',
  styleUrls: ['./employees-list.component.scss']
})
export class EmployeesListComponent implements OnInit {
  ButtonType = ButtonType
  instructors: User[] | null = null
  employees: User[] | null = null

  constructor(
    private userService: UserService,
    private snackBarService: SnackBarService,
    private router: Router
  ) {}

  ngOnInit(): void {
    const sortUsers = (a: User, b: User) => {
      if (a.firstName < b.firstName) return -1
      if (b.firstName < a.firstName) return 1
      return 0
    }

    this.userService.getAllUsers(Role.INSTRUCTOR).subscribe({
      next: (instructors: User[]) => {
        this.instructors = instructors.sort(sortUsers)
      },
      error: ({ error }) => {
        this.snackBarService.showError(error?.message ?? '')
      }
    })

    this.userService.getAllUsers(Role.EMPLOYEE).subscribe({
      next: (employees: User[]) => {
        this.employees = employees.sort(sortUsers)
      },
      error: ({ error }) => {
        this.snackBarService.showError(error?.message ?? '')
      }
    })
  }

  addNewEmployee(): void {
    this.router.navigate(['/admin/mobile/employees/add'])
  }
}
