import { Component, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import { UserService } from "../../../../../core/services/userService";
import { SnackBarService } from "../../../../../core/services/snackBarService";
import { TranslateService } from "@ngx-translate/core";
import { ErrorMessageProvider, ErrorsService } from "../../../../../core/services/errorsService";
import { TextInputType } from "../../../../../core/types/enums/textInputType";
import { User } from "../../../../../core/types/user";

@Component({
  selector: 'app-edit-client',
  templateUrl: './edit-client.component.html',
  styleUrls: ['./edit-client.component.scss']
})
export class EditClientComponent implements OnInit {
  readonly TextInputType = TextInputType
  contactForm: FormGroup
  loading = false
  isEditMode = false
  userId: string | null = null

  constructor(
    private fb: FormBuilder, 
    private userService: UserService, 
    private snackBarService: SnackBarService,
    private translateService: TranslateService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.contactForm = this.fb.group({
      firstName: ['', [Validators.required]],
      lastName: ['', [Validators.required]],
      phoneNumber: ['', [
        Validators.required,
        Validators.pattern('^[+]?[0-9 ]*$'),
        Validators.minLength(7),
        Validators.maxLength(15)
      ]]
    });
  }

  ngOnInit(): void {
    this.userId = this.route.snapshot.paramMap.get('user-id')
    this.isEditMode = !!this.userId

    if (this.isEditMode && this.userId) {
      this.userService.getUser(this.userId).subscribe({
        next: (user: User) => {
          this.contactForm.patchValue({
            firstName: user.firstName,
            lastName: user.lastName,
            phoneNumber: user.phoneNumber
          })
        },
        error: ({error}) => {
          this.snackBarService.showError(error.message)
        }
      })
    }
  }

  get f() { 
    return this.contactForm.controls; 
  }

  onSubmit() {
    if (this.contactForm.valid) {
      this.loading = true 

      const clientData = {
        firstName: this.f['firstName'].value.trim(),
        lastName: this.f['lastName'].value.trim(),
        phoneNumber: this.f['phoneNumber'].value.trim()
      }

      if (this.isEditMode && this.userId) {
        this.userService.updateClient(this.userId, clientData).subscribe({
          next: () => {
            this.loading = false
            this.snackBarService.showSuccess(this.translateService.instant('CLIENTS.UPDATE_CLIENT_SUCCESS'))
            this.router.navigate(['../../', this.userId, 'details'], { relativeTo: this.route.parent })
          },
          error: ({error}) => {
            this.loading = false
            this.snackBarService.showError(error.message)
          }
        })
      } else {
        this.userService.addNewClient(clientData).subscribe({
          next: () => {
            this.loading = false
            this.snackBarService.showSuccess(this.translateService.instant('CLIENTS.ADD_NEW_CLIENT_SUCCESS'))
            this.contactForm.reset()
            this.contactForm.markAsUntouched()
            this.contactForm.markAsPristine()
          }, 
          error: ({error}) => {
            this.loading = false
            this.snackBarService.showError(error.message)
          }
        })
      }
    } else {
      this.contactForm.markAllAsTouched()
    }
  }

  getErrorMessage(controlName: string): string {
    return ''
  }
}