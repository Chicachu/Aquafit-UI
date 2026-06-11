import { PaymentType } from "../enums/paymentType"

export type ApplyPaymentRequest = {
  amount: number
  paymentType: PaymentType
}
