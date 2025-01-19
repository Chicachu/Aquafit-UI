import { Payment } from "./payment"
import { Document } from "./document"

export type ClientEnrollmentDetails = Document & {
  fullName: string
  currentPayment: Payment
}