import { ClassType } from "./enums/classType"
import { Currency } from "./enums/currency"
import { Weekday } from "./enums/weekday"
import { Document } from "./document"

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
    reason: string
  }[]
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
  maxCapacity: number
}

