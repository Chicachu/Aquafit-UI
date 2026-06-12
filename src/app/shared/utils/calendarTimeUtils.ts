/** Aquafit operates in Puerto Vallarta — use this TZ for calendar date keys. */
export const BUSINESS_TIME_ZONE = 'America/Mazatlan';

/** Map a class startTime ("14:00") to the calendar hour-slot key ("14:00"). */
export function calendarTimeSlotKey(startTime: string | undefined): string {
  if (!startTime) {
    return '0:00';
  }

  const hour = parseInt(startTime.split(':')[0], 10);
  return `${Number.isNaN(hour) ? 0 : hour}:00`;
}

/** YYYY-MM-DD date key in the business timezone (matches API schedule grouping). */
export function businessDateKey(date: Date): string {
  return date.toLocaleDateString('en-CA', { timeZone: BUSINESS_TIME_ZONE });
}
