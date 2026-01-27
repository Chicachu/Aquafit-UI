import { Class } from "../classes/class";
import { User } from "../user";
import { Assignment } from "../assignment";

export type InstructorClassDetails = {
  instructor: User
  assignmentInfo: {
    class: Class
    assignment: Assignment
  }[]
}
