import { CheckInType, EmployeeCheckIn } from '@core/services/checkInService';

export const CHECK_IN_COOLDOWN_MS = 15 * 60 * 1000;

export enum CheckInValidationCode {
  OPEN_CHECK_IN = 'OPEN_CHECK_IN',
  COOLDOWN_AFTER_CHECK_OUT = 'COOLDOWN_AFTER_CHECK_OUT',
  NO_OPEN_CHECK_IN = 'NO_OPEN_CHECK_IN',
  COOLDOWN_AFTER_CHECK_IN = 'COOLDOWN_AFTER_CHECK_IN',
}

export type CheckInValidationResult = {
  valid: boolean;
  code?: CheckInValidationCode;
};

function toTime(value: Date | string): number {
  return new Date(value).getTime();
}

function sortEntries(entries: EmployeeCheckIn[]): EmployeeCheckIn[] {
  return [...entries].sort((a, b) => {
    const diff = toTime(a.date) - toTime(b.date);
    if (diff !== 0) {
      return diff;
    }

    if (a.type === CheckInType.CHECK_IN && b.type === CheckInType.CHECK_OUT) {
      return -1;
    }
    if (a.type === CheckInType.CHECK_OUT && b.type === CheckInType.CHECK_IN) {
      return 1;
    }

    return 0;
  });
}

export function validateCheckInEntry(
  existingEntries: EmployeeCheckIn[],
  proposedType: CheckInType,
  proposedDate: Date
): CheckInValidationResult {
  const proposed: EmployeeCheckIn = {
    _id: '__proposed__',
    employeeId: '',
    type: proposedType,
    date: proposedDate.toISOString(),
    createdAt: '',
    updatedAt: '',
  };

  const timeline = sortEntries([...existingEntries, proposed]);

  let openCheckIn: EmployeeCheckIn | null = null;
  let lastCheckOut: EmployeeCheckIn | null = null;

  for (const entry of timeline) {
    if (entry.type === CheckInType.CHECK_IN) {
      if (openCheckIn) {
        return entry._id === proposed._id
          ? { valid: false, code: CheckInValidationCode.OPEN_CHECK_IN }
          : { valid: false, code: CheckInValidationCode.OPEN_CHECK_IN };
      }

      if (
        lastCheckOut
        && toTime(entry.date) < toTime(lastCheckOut.date) + CHECK_IN_COOLDOWN_MS
      ) {
        return entry._id === proposed._id
          ? { valid: false, code: CheckInValidationCode.COOLDOWN_AFTER_CHECK_OUT }
          : { valid: false, code: CheckInValidationCode.COOLDOWN_AFTER_CHECK_OUT };
      }

      openCheckIn = entry;
      continue;
    }

    if (!openCheckIn) {
      return entry._id === proposed._id
        ? { valid: false, code: CheckInValidationCode.NO_OPEN_CHECK_IN }
        : { valid: false, code: CheckInValidationCode.NO_OPEN_CHECK_IN };
    }

    if (toTime(entry.date) < toTime(openCheckIn.date) + CHECK_IN_COOLDOWN_MS) {
      return entry._id === proposed._id
        ? { valid: false, code: CheckInValidationCode.COOLDOWN_AFTER_CHECK_IN }
        : { valid: false, code: CheckInValidationCode.COOLDOWN_AFTER_CHECK_IN };
    }

    openCheckIn = null;
    lastCheckOut = entry;
  }

  return { valid: true };
}
