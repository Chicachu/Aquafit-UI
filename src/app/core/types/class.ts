import { ClassTypes } from "./enums/classTypes"
import { Currencies } from "./enums/currencies"
import { Weekday } from "./enums/weekday"

export type Class = {
  classLocation: string
  classType: ClassTypes
  days: Weekday[]
  startDate: Date
  endDate?: Date | null
  startTime: string
  prices: Map<Currencies | string, number>
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