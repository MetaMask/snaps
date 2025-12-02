import { refine, string } from '@metamask/superstruct';
import { DateTime, Duration } from 'luxon';

/**
 * Refines a string as an ISO 8601 duration.
 */
export const ISO8601DurationStruct = refine(
  string(),
  'ISO 8601 duration',
  (value) => {
    const parsedDuration = Duration.fromISO(value);
    if (!parsedDuration.isValid) {
      return 'Not a valid ISO 8601 duration';
    }

    return true;
  },
);

/**
 * Remove millisecond precision from an ISO 8601 string.
 *
 * @param value - A valid ISO 8601 date.
 * @returns A valid ISO 8601 date with millisecond precision removed.
 */
export function toCensoredISO8601String(value: string) {
  const date = DateTime.fromISO(value, { setZone: true });

  // Make sure any millisecond precision is removed.
  return date.startOf('second').toISO({
    suppressMilliseconds: true,
  }) as string;
}

export { ISO8601DateStruct } from '@metamask/snaps-sdk';
