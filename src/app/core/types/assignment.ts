import { Document } from "./document";
import { AssignmentStatus } from "./enums/assignmentStatus";
import { Price } from "./price";

export type Assignment = Document & {
  employeeId: string
  classId: string
  startDate: string
  endDate?: string | null
  paymentValue?: Price | null
  status?: AssignmentStatus
}

export type AssignmentCreationDTO = {
  classId: string
  employeeId: string
  startDate: Date
  endDate?: Date | null
}
