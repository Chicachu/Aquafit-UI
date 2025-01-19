import { Currency } from "./enums/currency"
import { Role } from "./enums/role"
import { Document } from "./document"

export type User = Document & {
  firstName: string
  lastName: string
  phoneNumber: string
  role: Role
  username?: string | null
  password?: string | null
  credits?: {
    amount: number
    currency: Currency
  } | null
  accessToken?: string | null
}