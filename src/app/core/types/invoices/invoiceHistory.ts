import { Weekday } from "../enums/weekday"
import { Invoice } from "./invoice"

export type InvoiceHistory = {
  invoices: Invoice[]
  clientName: string
  classDetails: {
    classType: string
    classLocation: string
    days: number[]
  }
}