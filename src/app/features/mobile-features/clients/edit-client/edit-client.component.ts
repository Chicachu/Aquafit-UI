import { Component, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import { UserService } from "@core/services/userService";
import { SnackBarService } from "@core/services/snackBarService";
import { TranslateService } from "@ngx-translate/core";
import { TextInputType } from "@core/types/enums/textInputType";
import { User } from "@core/types/user";
import { Role } from "@core/types/enums/role";

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

  get editBreadcrumbTitle(): string {
    return this.isEditMode ? 'CLIENTS.EDIT_CLIENT' : 'CLIENTS.ADD_NEW_CLIENT'
  }

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
      countryCode: ['+52', Validators.required],
      phoneNumber: ['', [
        Validators.pattern('^[+]?[0-9 ]*$'),
        Validators.maxLength(15)
      ]]
    })
  }

  ngOnInit(): void {
    this.userId = this.route.snapshot.paramMap.get('user-id')
    this.isEditMode = !!this.userId

    if (this.isEditMode && this.userId) {
      this.userService.getUser(this.userId).subscribe({
        next: (user: User) => {
          let phoneNumber = user.phoneNumber ?? ''
          let countryCode = '+52' // Default
          
          // Extract country code from phone number if it exists
          if (phoneNumber) {
            const match = phoneNumber.match(/^(\+\d{1,3})\s?(.+)$/)
            if (match) {
              countryCode = match[1]
              phoneNumber = match[2]
            }
          }
          
          this.contactForm.patchValue({
            firstName: user.firstName,
            lastName: user.lastName,
            countryCode: countryCode,
            phoneNumber: phoneNumber
          })
        },
        error: (err: { error?: { message?: string } }) => {
          this.snackBarService.showError(err.error?.message ?? '')
        }
      })
    }
  }

  get f() {
    return this.contactForm.controls
  }

  onSubmit() {
    if (this.contactForm.valid) {
      this.loading = true

      const clientData: {
        firstName: string,
        lastName: string,
        phoneNumber?: string,
        role: Role
      } = {
        firstName: this.f['firstName'].value.trim(),
        lastName: this.f['lastName'].value.trim(),
        role: Role.CLIENT
      }

      const phoneNumberValue = this.f['phoneNumber'].value?.trim()
      const countryCodeValue = this.f['countryCode'].value
      if (phoneNumberValue) {
        // Combine country code with phone number if country code exists
        let combinedPhoneNumber = phoneNumberValue
        if (countryCodeValue && phoneNumberValue) {
          // Remove any existing country code from phone number
          combinedPhoneNumber = phoneNumberValue.replace(/^\+\d{1,3}\s?/, '')
          combinedPhoneNumber = `${countryCodeValue} ${combinedPhoneNumber}`.trim()
        }
        clientData.phoneNumber = combinedPhoneNumber
      }

      if (this.isEditMode && this.userId) {
        this.userService.updateClient(this.userId, clientData).subscribe({
          next: () => {
            this.loading = false
            this.snackBarService.showSuccess(this.translateService.instant('CLIENTS.UPDATE_CLIENT_SUCCESS'))
            this.router.navigate(['../details'], { relativeTo: this.route })
          },
          error: (err: { error?: { message?: string } }) => {
            this.loading = false
            this.snackBarService.showError(err.error?.message ?? '')
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
          error: (err: { error?: { message?: string } }) => {
            this.loading = false
            this.snackBarService.showError(err.error?.message ?? '')
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
