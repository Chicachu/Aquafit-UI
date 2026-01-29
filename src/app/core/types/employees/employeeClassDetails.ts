import { Class } from "../classes/class";
import { User } from "../user";
import { Assignment } from "../assignment";

export type EmployeeClassDetails = {
  employee: User;
  assignmentInfo: {
    class: Class;
    assignment: Assignment;
  }[];
};
