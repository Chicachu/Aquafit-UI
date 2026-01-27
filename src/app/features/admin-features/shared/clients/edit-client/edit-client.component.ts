import { Component, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import { UserService } from "../../../../../core/services/userService";
import { SnackBarService } from "../../../../../core/services/snackBarService";
import { TranslateService } from "@ngx-translate/core";
import { ErrorMessageProvider, ErrorsService } from "../../../../../core/services/errorsService";
import { TextInputType } from "../../../../../core/types/enums/textInputType";
import { User } from "../../../../../core/types/user";
import { Role } from "../../../../../core/types/enums/role";

@Component({
  selector: 'app-edit-client',
  templateUrl: './edit-client.component.html',
  styleUrls: ['./edit-client.component.scss']
})
export class EditClientComponent implements OnInit {
  readonly TextInputType = TextInputType
  readonly Role = Role
  contactForm: FormGroup
  loading = false
  isEditMode = false
  userId: string | null = null
  instructorId: number | null = null
  get isAdmin(): boolean {
    return this.userService.isAdmin
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
      phoneNumber: ['', [
        Validators.pattern('^[+]?[0-9 ]*$'),
        Validators.maxLength(15)
      ]],
      isInstructor: [false]
    });
  }

  ngOnInit(): void {
    this.userId = this.route.snapshot.paramMap.get('user-id')
    this.isEditMode = !!this.userId

    // Subscribe to checkbox changes to generate instructorId and update phone number validation
    this.contactForm.get('isInstructor')?.valueChanges.subscribe(isInstructor => {
      const phoneNumberControl = this.contactForm.get('phoneNumber')
      
      if (isInstructor) {
        if (!this.isEditMode || !this.instructorId) {
          this.generateInstructorId()
        }
        // Make phone number required when instructor is checked
        phoneNumberControl?.setValidators([
          Validators.required,
          Validators.pattern('^[+]?[0-9 ]*$'),
          Validators.maxLength(15)
        ])
      } else {
        this.instructorId = null
        // Remove required validator when instructor is unchecked
        phoneNumberControl?.setValidators([
          Validators.pattern('^[+]?[0-9 ]*$'),
          Validators.maxLength(15)
        ])
      }
      phoneNumberControl?.updateValueAndValidity()
    })

    if (this.isEditMode && this.userId) {
      this.userService.getUser(this.userId).subscribe({
        next: (user: User) => {
          const isInstructor = user.role === Role.INSTRUCTOR
          this.contactForm.patchValue({
            firstName: user.firstName,
            lastName: user.lastName,
            phoneNumber: user.phoneNumber,
            isInstructor: isInstructor
          })
          if (user.instructorId) {
            this.instructorId = user.instructorId
          }
          
          // Update phone number validators based on instructor status
          const phoneNumberControl = this.contactForm.get('phoneNumber')
          if (isInstructor) {
            phoneNumberControl?.setValidators([
              Validators.required,
              Validators.pattern('^[+]?[0-9 ]*$'),
              Validators.maxLength(15)
            ])
          } else {
            phoneNumberControl?.setValidators([
              Validators.pattern('^[+]?[0-9 ]*$'),
              Validators.maxLength(15)
            ])
          }
          phoneNumberControl?.updateValueAndValidity()
        },
        error: ({error}) => {
          this.snackBarService.showError(error.message)
        }
      })
    }
  }

  generateInstructorId(): void {
    // Call API to get the next available instructorId
    this.userService.getNextInstructorId().subscribe({
      next: (response) => {
        this.instructorId = response.instructorId
      },
      error: ({error}) => {
        this.snackBarService.showError(error.message || 'Failed to generate instructor ID')
        // Fallback to 1 if API call fails
        this.instructorId = 1
      }
    })
  }

  get f() { 
    return this.contactForm.controls; 
  }

  onSubmit() {
    if (this.contactForm.valid) {
      this.loading = true 

      const isInstructor = this.f['isInstructor'].value
      const role = isInstructor ? Role.INSTRUCTOR : Role.CLIENT

      const clientData: { 
        firstName: string, 
        lastName: string, 
        phoneNumber?: string,
        role?: Role,
        instructorId?: number | null
      } = {
        firstName: this.f['firstName'].value.trim(),
        lastName: this.f['lastName'].value.trim(),
        role
      }
      
      const phoneNumberValue = this.f['phoneNumber'].value?.trim()
      // Phone number is required for instructors, optional for clients
      if (isInstructor) {
        clientData.phoneNumber = phoneNumberValue
      } else if (phoneNumberValue) {
        clientData.phoneNumber = phoneNumberValue
      }

      if (isInstructor && this.instructorId !== null) {
        clientData.instructorId = this.instructorId
      } else if (!isInstructor && this.isEditMode) {
        // Clear instructorId when unchecking in edit mode
        clientData.instructorId = null
      }

      if (this.isEditMode && this.userId) {
        this.userService.updateClient(this.userId, clientData).subscribe({
          next: () => {
            this.loading = false
            this.snackBarService.showSuccess(this.translateService.instant('CLIENTS.UPDATE_CLIENT_SUCCESS'))
            this.router.navigate(['../details'], { relativeTo: this.route })
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
            this.contactForm.patchValue({ isInstructor: false })
            this.instructorId = null
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