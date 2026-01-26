import { PaymentType } from "../enums/paymentType"
import { Price } from "../price"

export type Payment = {
  charge: Price 
  date: Date
  paymentType: PaymentType
}