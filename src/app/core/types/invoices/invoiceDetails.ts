import { Currency } from "../enums/currency"
import { PaymentStatus } from "../enums/paymentStatus"
import { PaymentType } from "../enums/paymentType"
import { Weekday } from "../enums/weekday"
import { Period } from "../period"
import { Price } from "../price"

export type InvoiceDetails = {
  clientName: string 
  classDetails: {
    classType: string
    classLocation: string
    days: Weekday[]
  }
  originalPrice?: Price
  charge: Price 
  discountsApplied?: {
      discountId?: string | null
      amountOverride?: {
        amount: number
        currency: Currency
      } | null
      amountSnapshot?: {
        amount: number
        currency: Currency
      } | null
      description?: string | null
    }[]
    paymentsApplied: {
      charge: Price
      date: Date
      paymentType: PaymentType
    }[]
    paymentStatus: PaymentStatus
    period: Period
    bonusSessionsApplied?: number
    originalEndDate?: Date
}