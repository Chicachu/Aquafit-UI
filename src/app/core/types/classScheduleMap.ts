import { ClassType } from "./enums/classType";

export type ClassScheduleMap = Partial<Record<ClassType, Record<string, Record<string, string>>>>