import { Class } from "./class";
import { ClassClientEnrollmentDetails } from "../classes/classClientEnrollmentDetails";
import { User } from "../user";

export type ClassDetails = Class & {
  clients: ClassClientEnrollmentDetails[]
  waitlistClients: User[]
}