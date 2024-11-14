import { ClassType } from "./enums/classType"
import { Currency } from "./enums/currency"
import { Weekday } from "./enums/weekday"

export type Class = {
  classLocation: string
  classType: ClassType
  days: Weekday[]
  startDate: Date
  endDate?: Date | null
  startTime: string
  prices: Map<Currency | string, number>
  maxCapacity: number
  checkIns: {
    date: Date
    instructorId: string
    clientIds: string[]
  }[]
  cancellations: {
    date: Date
    instructorId: string
    reason: string
  }[]
}