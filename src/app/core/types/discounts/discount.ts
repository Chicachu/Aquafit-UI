import { Document } from "../document"
import { DiscountType } from "../enums/discountType"
import { Period } from "../period"

export type Discount = Document & {
  description: string
  type: DiscountType
  amount?: number
  period?: Period
}