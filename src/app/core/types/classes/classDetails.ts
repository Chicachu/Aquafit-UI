import { Class } from "./class";
import { ClassClientEnrollmentDetails } from "../classes/classClientEnrollmentDetails";
import { User } from "../user";
import { Weekday } from "../enums/weekday";

export type ClassDetails = Class & {
  clients: ClassClientEnrollmentDetails[]
  waitlistClients?: User[]
  enrollmentCounts: Record<Weekday, number>
}