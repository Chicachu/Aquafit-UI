import { Period } from "../period"
import { PaymentStatus } from "../enums/paymentStatus"

export type EmployeePayable = {
  period: Period
  paymentStatus: PaymentStatus
}
