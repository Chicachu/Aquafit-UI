import { Document } from "./document";
import { AssignmentStatus } from "./enums/assignmentStatus";

export type Assignment = Document & {
  instructorId: string
  classId: string
  startDate: string
  endDate?: string | null
  status?: AssignmentStatus
}

export type AssignmentCreationDTO = {
  classId: string
  instructorId: string
  startDate: Date
  endDate?: Date | null
}
