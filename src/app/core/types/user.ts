import { Currency } from "./enums/currency"
import { Role } from "./enums/role"
import { Document } from "./document"

export type Note = {
  _id: string
  content: string
  createdAt: string
  updatedAt: string
}

export type User = Document & {
  firstName: string
  lastName: string
  phoneNumber?: string | null
  role: Role
  username?: string | null
  password?: string | null
  credits?: {
    amount: number
    currency: Currency
  } | null
  accessToken?: string | null
  notes?: Note[] | null
  instructorId?: number | null
}