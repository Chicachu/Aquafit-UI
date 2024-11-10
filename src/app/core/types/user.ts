import { Role } from "./enums/role"

export type User = {
  firstName: string
  lastName: string
  phoneNumber: string
  role: Role
  username?: string | null
  password?: string | null
  // credits?: {
  //   amount: number
  //   currency: Currency
  // } | null
  accessToken?: string | null
}