import { Component } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { UserService } from "../../../../../core/services/userService";
import { SnackBarService } from "../../../../../core/services/snackBarService";
import { TranslateService } from "@ngx-translate/core";

@Component({
  selector: 'app-edit-client',
  templateUrl: './edit-client.component.html',
  styleUrls: ['./edit-client.component.scss']
})
export class EditClientComponent {
  contactForm: FormGroup;

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

  formatPhoneNumber(event: Event) {
    const input = event.target as HTMLInputElement;
    let value = input.value.replace(/\D/g, ''); 
    
    if (value.length > 1) {
      if (value.length === 10) {
        value = value.replace(/(\d{3})(\d{3})(\d{4})/, '$1 $2 $3');
      } else if (value.length === 11) {
        value = value.replace(/(\d{1})(\d{3})(\d{3})(\d{4})/, '$1 $2 $3 $4');
      } else if (value.length === 12) {
        value = value.replace(/(\d{2})(\d{3})(\d{3})(\d{4})/, '$1 $2 $3 $4');
      } else if (value.length === 13) {
        value = value.replace(/(\d{3})(\d{3})(\d{3})(\d{4})/, '$1 $2 $3 $4');
      } else if (value.length === 7) { 
        value = value.replace(/(\d{3})(\d{4})/, '$1 $2');
      } 
    }
    
    this.contactForm.patchValue({
      phoneNumber: value
    }, { emitEvent: false });
  }

  onSubmit() {
    if (this.contactForm.valid) {
      const addNewClientRequest = {
        firstName: this.f['firstName'].value.trim(),
        lastName: this.f['lastName'].value.trim(),
        phoneNumber: this.f['phoneNumber'].value.trim()
      }

      this.userService.addNewClient(addNewClientRequest).subscribe({
        next: () => {
          this.snackBarService.showSuccess(this.translateService.instant('CLIENTS.ADD_NEW_CLIENT_SUCCESS'))
          this.contactForm.reset()
          this.contactForm.markAsUntouched()
          this.contactForm.markAsPristine()
        }, 
        error: ({error}) => {
          this.snackBarService.showError(error.message)
        }
      })
    }
  }
}