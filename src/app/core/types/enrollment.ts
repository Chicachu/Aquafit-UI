import { Document } from "./document"
import { BillingFrequency } from "./enums/billingFrequency"
import { Currency } from "./enums/currency"
import { Weekday } from "./enums/weekday"
import { EnrollmentStatus } from "./enums/enrollmentStatus"

export type Enrollment = Document & {
  userId: string
  classId: string
  startDate: Date
  billingFrequency: BillingFrequency
  status?: EnrollmentStatus
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
  endDate?: Date
  cancelDate?: Date
  cancelReason?: string
  invoiceIds: string[]
}