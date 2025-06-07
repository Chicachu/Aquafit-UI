import { Currency } from "./enums/currency"

export type Price = {
  currency: Currency
  amount: number
}