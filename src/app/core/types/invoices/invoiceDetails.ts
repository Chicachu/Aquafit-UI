import { Currency } from "../enums/currency"
import { PaymentStatus } from "../enums/paymentStatus"
import { PaymentType } from "../enums/paymentType"
import { Weekday } from "../enums/weekday"
import { Price } from "../price"

export type InvoiceDetails = {
  clientName: string 
  classDetails: {
    classType: string
    classLocation: string
    days: Weekday[]
  }
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
      amount: number
      currency: Currency
      date: Date
      paymentType: PaymentType
    }[]
    paymentStatus: PaymentStatus
    period: {
      startDate: Date
      dueDate: Date
    }
}