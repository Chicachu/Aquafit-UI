import { Currency } from "./enums/currency"
import { PaymentStatus } from "./enums/paymentStatus"
import { Document } from "./document"

export type Payment = Document & {
  clientId: string
  enrollmentId: string
  amount: {
    currency: Currency
    value: number
  }
  discountsApplied: {
    discountId: string
    amount: number
  }[]
  paymentsHistory: {
    currency: Currency
    value: number
    date: Date
  }[]
  paymentStatus: PaymentStatus
  period: {
    start: Date, 
    duteDate: Date
  }
}