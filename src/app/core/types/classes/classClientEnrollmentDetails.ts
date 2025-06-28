import { Invoice } from "../invoice"
import { Document } from "../document"
import { Weekday } from "../enums/weekday"

export type ClassClientEnrollmentDetails = Document & {
  firstName: string
  lastName: string
  currentPayment: Invoice
}