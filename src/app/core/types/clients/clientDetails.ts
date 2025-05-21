import { Class } from "../classes/class";
import { Payment } from "../payment";
import { User } from "../user";

export type ClientDetails = User & {
  enrolledClasses: {
    class: Class, 
    payment: Payment
  }[]
}