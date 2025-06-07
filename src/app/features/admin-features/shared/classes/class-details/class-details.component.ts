import { Component, OnInit } from "@angular/core";
import { ClassService } from "@/core/services/classService";
import { ActivatedRoute } from "@angular/router";
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
  
  constructor(
    private classService: ClassService, 
    private route: ActivatedRoute, 
    private snackBarService: SnackBarService
  ) {}

  ngOnInit(): void {
    const classId = this.route.snapshot.paramMap.get('class-id')
    this.classService.getClassDetails(classId!).subscribe({
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

  private _separateClientsByPaymentStatus(classDetails: ClassDetails): void {
    classDetails.clients.forEach((client) => {
      const group = this.clientsByPaymentStatus.get(client.currentPayment.paymentStatus) || []

      group.push(client)

      this.clientsByPaymentStatus.set(client.currentPayment.paymentStatus, group)
    })
  }
}