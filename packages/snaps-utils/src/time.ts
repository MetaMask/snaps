import { is, refine, string } from '@metamask/superstruct';
import { DateTime, Duration } from 'luxon';

/**
 * Refines a string as an ISO 8601 duration.
 */
export const Iso8601DurationStruct = refine(
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
 * Regex to match the offset part of an ISO 8601 date.
 */
const offsetRegex = /Z|([+-]\d{2}:?\d{2})$/u;

/**
 * Refines a string as an ISO 8601 date.
 */
export const Iso8601DateStruct = refine(string(), 'ISO 8601 date', (value) => {
  const parsedDate = DateTime.fromISO(value);

  if (!parsedDate.isValid) {
    return 'Not a valid ISO 8601 date';
  }

  if (!offsetRegex.test(value)) {
    // Luxon doesn't have a reliable way to check if timezone info was not provided
    return 'ISO 8601 date must have timezone information';
  }

  return true;
});

/**
 * Generates a `DateTime` object based on if a duration or date is provided.
 *
 * @param iso8601Time - The ISO 8601 time string.
 * @returns A `DateTime` object.
 */
export function getStartDate(iso8601Time: string) {
  if (is(iso8601Time, Iso8601DurationStruct)) {
    return DateTime.fromJSDate(new Date())
      .toUTC()
      .plus(Duration.fromISO(iso8601Time));
  }

  return DateTime.fromISO(iso8601Time, { setZone: true });
}
