import { Currencies } from "./enums/currencies"
import { Role } from "./enums/role"

export type User = {
  firstName: string
  lastName: string
  phoneNumber: string
  role: Role
  username?: string | null
  password?: string | null
  credits?: {
    amount: number
    currency: Currencies
  } | null
  accessToken?: string | null
}