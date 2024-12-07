import { Component } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { UserService } from "../../../../../core/services/userService";
import { SnackBarService } from "../../../../../core/services/snackBarService";
import { TranslateService } from "@ngx-translate/core";
import { ErrorMessageProvider, ErrorsService } from "../../../../../core/services/errorsService";
import { TextInputType } from "../../../../../core/types/enums/textInputType";

@Component({
  selector: 'app-edit-client',
  templateUrl: './edit-client.component.html',
  styleUrls: ['./edit-client.component.scss']
})
export class EditClientComponent {
  readonly TextInputType = TextInputType
  contactForm: FormGroup
  loading = false

  constructor(
    private fb: FormBuilder, 
    private userService: UserService, 
    private snackBarService: SnackBarService,
    private translateService: TranslateService
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

  get f() { 
    return this.contactForm.controls; 
  }

  onSubmit() {
    if (this.contactForm.valid) {
      this.loading = true 

      const addNewClientRequest = {
        firstName: this.f['firstName'].value.trim(),
        lastName: this.f['lastName'].value.trim(),
        phoneNumber: this.f['phoneNumber'].value.trim()
      }

      this.userService.addNewClient(addNewClientRequest).subscribe({
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
    } else {
      this.contactForm.markAllAsTouched()
    }
  }

  getErrorMessage(controlName: string): string {
    return ''
  }
}