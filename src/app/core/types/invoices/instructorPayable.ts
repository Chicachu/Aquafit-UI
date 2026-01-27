import { Period } from "../period"
import { PaymentStatus } from "../enums/paymentStatus"

export type InstructorPayable = {
  period: Period
  paymentStatus: PaymentStatus
}
