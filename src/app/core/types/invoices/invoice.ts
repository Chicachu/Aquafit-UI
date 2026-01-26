import { Currency } from "../enums/currency"
import { PaymentStatus } from "../enums/paymentStatus"
import { Document } from "../document"
import { Price } from "../price"
import { PaymentType } from "../enums/paymentType"
import { Period } from "../period"

export type Invoice = Document & {
  clientId: string
  enrollmentId: string
  charge: Price 
  discountsApplied: {
    discountId: string
    amountOverride: {
      amount: number
      currency: Currency
    }
  }[]
  paymentsApplied: {
    amount: number
    currency: Currency
    date: Date
    paymentType: PaymentType
  }[]
  paymentStatus: PaymentStatus
  period: Period
}