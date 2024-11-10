import { Role } from "./enums/role"

export type User = {
  username?: string
  role: Role
  accessToken?: string
}