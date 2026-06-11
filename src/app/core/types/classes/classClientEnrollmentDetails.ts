import { Invoice } from "../invoices/invoice"
import { Document } from "../document"

export type ClassClientEnrollmentDetails = Document & {
  enrollmentId: string
  firstName: string
  lastName: string
  currentPayment?: Invoice | null
  isPartiallyEnrolled?: boolean
}