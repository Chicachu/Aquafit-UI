import { PaymentStatus } from '@core/types/enums/paymentStatus';

const PAYMENT_STATUS_TRANSLATION_KEYS: Record<PaymentStatus, string> = {
  [PaymentStatus.PAID]: 'PAYMENT_STATUS.PAID',
  [PaymentStatus.PENDING]: 'PAYMENT_STATUS.PENDING',
  [PaymentStatus.CANCELLED]: 'PAYMENT_STATUS.CANCELLED',
  [PaymentStatus.ALMOST_DUE]: 'PAYMENT_STATUS.ALMOST_DUE',
  [PaymentStatus.OVERDUE]: 'PAYMENT_STATUS.OVERDUE',
};

export function getPaymentStatusTranslationKey(status: PaymentStatus | string | null | undefined): string {
  if (!status) {
    return PAYMENT_STATUS_TRANSLATION_KEYS[PaymentStatus.PENDING];
  }

  if (PAYMENT_STATUS_TRANSLATION_KEYS[status as PaymentStatus]) {
    return PAYMENT_STATUS_TRANSLATION_KEYS[status as PaymentStatus];
  }

  const normalized = Object.values(PaymentStatus).find(
    paymentStatus => paymentStatus === status || paymentStatus === String(status).replace(/_/g, ' ')
  );

  return normalized
    ? PAYMENT_STATUS_TRANSLATION_KEYS[normalized]
    : PAYMENT_STATUS_TRANSLATION_KEYS[PaymentStatus.PENDING];
}
