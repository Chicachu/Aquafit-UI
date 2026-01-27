import { Document } from "./document";

export type Assignment = Document & {
  instructorId: string
  classId: string
  startDate: string
  endDate?: string | null
}

export type AssignmentCreationDTO = {
  classId: string
  instructorId: string
  startDate: Date
  endDate?: Date | null
}
