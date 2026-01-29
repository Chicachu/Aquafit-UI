import { Document } from "../document";
import { Period } from "../period";
import { PaymentStatus } from "../enums/paymentStatus";
import { Price } from "../price";

export type PayableLineItem = {
  assignmentId: string;
  sessionsCount: number;
  amount: Price;
  classType?: string;
  classLocation?: string;
  days?: number[];
  startTime?: string;
};

export type EmployeePayable = Document & {
  employeeId: string;
  period: Period;
  paymentStatus: PaymentStatus;
  charge: Price;
  lineItems?: PayableLineItem[];
};
