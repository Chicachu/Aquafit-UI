import { Class } from "./class";
import { ClassClientEnrollmentDetails } from "../classes/classClientEnrollmentDetails";
import { User } from "../user";
import { Weekday } from "../enums/weekday";

export type ClassInstructorSummary = {
  _id: string;
  firstName: string;
  lastName: string;
};

export type ClassDetails = Class & {
  clients: ClassClientEnrollmentDetails[]
  waitlistClients?: User[]
  enrollmentCounts: Record<Weekday, number>
  instructor?: ClassInstructorSummary | null
}