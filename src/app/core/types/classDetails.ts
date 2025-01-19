import { Class } from "./class";
import { ClientEnrollmentDetails } from "./clientEnrollmentDetails";
import { User } from "./user";

export type ClassDetails = Class & {
  clients: ClientEnrollmentDetails[]
  waitlistClients: User[]
}