import { ClassType } from "../enums/classType"
import { Currency } from "../enums/currency"
import { Weekday } from "../enums/weekday"
import { Document } from "../document"
import { BillingFrequency } from "../enums/billingFrequency"
import { Note } from "../user"

export type Class = Document & {
  classLocation: string 
  classType: ClassType
  days: Weekday[]
  startDate: Date
  endDate?: Date | null
  startTime: string
  prices: {
    amount: number
    currency: Currency
  }[],
  maxCapacity: number
  checkIns?: {
    date: Date
    instructorId: string
    clientIds: string[]
  }[]
  cancellations?: {
    date: Date
    instructorId: string
    reason?: string | null
  }[]
  notes?: Note[] | null
}

export type CreateClassDTO = {
  classLocation: string
  classType: ClassType
  days: Weekday[]
  startDate: Date
  startTime: string
  prices: {
    amount: number
    currency: Currency
  }[]
  billingFrequency: BillingFrequency
  maxCapacity: number
}

