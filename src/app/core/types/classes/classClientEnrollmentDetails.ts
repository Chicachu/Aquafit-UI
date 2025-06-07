import { Invoice } from "../invoice"
import { Document } from "../document"

export type ClassClientEnrollmentDetails = Document & {
  firstName: string
  lastName: string
  currentPayment: Invoice
}