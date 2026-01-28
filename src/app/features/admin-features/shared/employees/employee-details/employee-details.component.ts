import { Component } from "@angular/core";
import { ButtonType } from "../../breadcrumb-nav-bar/breadcrumb-nav-bar.component";
import { ActivatedRoute, Router } from "@angular/router";
import { UserService } from "@core/services/userService";
import { User } from "@core/types/user";
import { SnackBarService } from "@core/services/snackBarService";
import { Note } from "@core/types/user";

@Component({
  selector: 'app-employee-details',
  templateUrl: './employee-details.component.html',
  styleUrls: ['./employee-details.component.scss']
})
export class EmployeeDetailsComponent {
  ButtonType = ButtonType
  employeeId: string | null = null
  employee: User | null = null
  canEditEmployee = false

  constructor(
    private route: ActivatedRoute,
    private userService: UserService,
    private snackBarService: SnackBarService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.canEditEmployee = this.userService.isAdmin
    const userId = this.route.snapshot.paramMap.get('user-id')
    this.employeeId = userId

    this.userService.getUser(userId!).subscribe({
      next: (user: User) => {
        this.employee = user
      },
      error: ({ error }) => {
        this.snackBarService.showError(error?.message ?? '')
      }
    })
  }

  editEmployee(): void {
    if (this.employeeId) {
      this.router.navigate(['/admin/mobile/employees', this.employeeId, 'edit'])
    }
  }

  onNotesUpdated(notes: Note[]): void {
    if (this.employee) {
      this.employee.notes = notes
    }
  }
}
