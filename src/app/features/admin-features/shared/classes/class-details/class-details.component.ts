import { Component, OnInit } from "@angular/core";
import { ClassService } from "@/core/services/classService";
import { UserService } from "@/core/services/userService";
import { ActivatedRoute, Router } from "@angular/router";
import { ClassDetails } from "@/core/types/classes/classDetails";
import { SnackBarService } from "@/core/services/snackBarService";
import { ButtonType } from "../../breadcrumb-nav-bar/breadcrumb-nav-bar.component";
import { PaymentStatus } from "@/core/types/enums/paymentStatus";
import { ClassClientEnrollmentDetails } from "@/core/types/classes/classClientEnrollmentDetails";

@Component({
  selector: 'app-class-details',
  templateUrl: './class-details.component.html',
  styleUrls: ['./class-details.component.scss']
})
export class ClassDetailsComponent implements OnInit {
  ButtonType = ButtonType
  PaymentStatus = PaymentStatus
  classDetails: ClassDetails | null = null 
  navBarInfo: string[] = []
  clientsByPaymentStatus: Map<PaymentStatus, ClassClientEnrollmentDetails[] | []> = new Map()
  loading = false
  classId: string | null = null
  canEditClass = false
  paymentStatusConfig: Partial<{
    [key in PaymentStatus]: {
      titleKey: string
      headingClass: string
      iconClass?: string
    }
  }> = {
    [PaymentStatus.PAID]: {
      titleKey: 'PAYMENT_STATUS.PAID',
      headingClass: 'primary-green',
      iconClass: 'paid-status-icon'
    },
    [PaymentStatus.PENDING]: {
      titleKey: 'PAYMENT_STATUS.PENDING',
      headingClass: 'mid-green'
    },
    [PaymentStatus.ALMOST_DUE]: {
      titleKey: 'PAYMENT_STATUS.ALMOST_DUE',
      headingClass: 'yellow',
      iconClass: 'almost-due-status-icon'
    },
    [PaymentStatus.OVERDUE]: {
      titleKey: 'PAYMENT_STATUS.OVERDUE',
      headingClass: 'red',
      iconClass: 'overdue-status-icon'
    }
  }
  readonly visibleStatuses = Object.keys(this.paymentStatusConfig) as PaymentStatus[]
  
  constructor(
    private classService: ClassService, 
    private userService: UserService,
    private route: ActivatedRoute,
    private router: Router,
    private snackBarService: SnackBarService
  ) {}

  ngOnInit(): void {
    this.canEditClass = this.userService.isAdmin
    this.classId = this.route.snapshot.paramMap.get('class-id')
    this.classService.getClassDetails(this.classId!).subscribe({
      next: (classDetails: ClassDetails) => {
        this.classDetails = classDetails
        this._separateClientsByPaymentStatus(classDetails)
      },
      error: ({error}) => {
        this.snackBarService.showError(error.message)
      }
    })
  }

  addClientToClass(): void {
    
  }

  cancelClass(): void {
    // call api - api will find this class with a class Id, iterate through all clients (except overdue clients) 
    // and give them a free bonus session. 
  }

  terminateClass(): void {

  }

  public getStatusSectionClass(status: PaymentStatus): string {
    const cleanStatus = status.toLowerCase().replace(/[\s_]+/g, '-')
    return status === PaymentStatus.PENDING
      ? 'pending-status-section'
      : `flex-row ${cleanStatus}-status-section`
  }
  
  editClass(): void {
    if (this.classId) {
      this.router.navigate(['../edit'], { relativeTo: this.route })
    }
  }

  private _separateClientsByPaymentStatus(classDetails: ClassDetails): void {
    classDetails.clients.forEach((client) => {
      const group = this.clientsByPaymentStatus.get(client.currentPayment.paymentStatus) || []

      group.push(client)

      this.clientsByPaymentStatus.set(client.currentPayment.paymentStatus, group)
    })
  }
}