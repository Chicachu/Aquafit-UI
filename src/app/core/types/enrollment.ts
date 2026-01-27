import { Document } from "./document"
import { BillingFrequency } from "./enums/billingFrequency"
import { Currency } from "./enums/currency"
import { Weekday } from "./enums/weekday"

export type Enrollment = Document & {
  userId: string
  classId: string
  startDate: Date
  billingFrequency: BillingFrequency
  discountsApplied: {
    discountId: string
    amountOverride: {
      amount: number 
      currency: Currency
    }
    amountSnapshot: {
      amount: number 
      currency: Currency
    }
    description: string
  }[]
  daysOfWeekOverride?: Weekday[]
  bonusSessions?: number
  bonusSessionsConsumed?: number
  isTrial?: boolean
  cancelDate?: Date
  cancelReason?: string
  invoiceIds: string[]
}