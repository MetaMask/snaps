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
 * Regex to match the offset part of an ISO 8601 date.
 */
const offsetRegex = /Z|([+-]\d{2}:?\d{2})$/u;

/**
 * Refines a string as an ISO 8601 date.
 */
export const ISO8601DateStruct = refine(string(), 'ISO 8601 date', (value) => {
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
