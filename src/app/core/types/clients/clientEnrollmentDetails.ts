import { Class } from "../classes/class";
import { Enrollment } from "../enrollment";
import { User } from "../user";

export type ClientEnrollmentDetails = {
  client: User
  enrolledClassInfo: {
    class: Class, 
    enrollment: Enrollment
  }[]
}