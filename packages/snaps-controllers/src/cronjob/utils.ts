import type { CronjobSpecification } from '@metamask/snaps-utils';
import { assert, hasProperty } from '@metamask/utils';
import { parseExpression } from 'cron-parser';
import { DateTime, Duration } from 'luxon';

/**
 * Get the schedule from a cronjob specification.
 *
 * This function assumes the cronjob specification is valid and contains
 * either a `duration` or an `expression` property.
 *
 * @param specification - The cronjob specification to extract the schedule
 * from.
 * @returns The schedule of the cronjob, which can be either an ISO 8601
 * duration or a cron expression.
 */
export function getCronjobSpecificationSchedule(
  specification: CronjobSpecification,
) {
  if (hasProperty(specification, 'duration')) {
    return specification.duration as string;
  }

  return specification.expression;
}

/**
 * Get a duration with a minimum of 1 second. This function assumes the provided
 * duration is valid.
 *
 * @param duration - The duration to validate.
 * @returns The validated duration.
 */
function getDuration(duration: Duration): Duration<true> {
  if (duration.as('seconds') < 1) {
    return Duration.fromObject({ seconds: 1 });
  }

  return duration;
}

/**
 * Get the current date in ISO 8601 format with millisecond precision removed.
 *
 * @returns The current date in ISO 8601 format.
 */
export function getCurrentDate() {
  const date = DateTime.fromJSDate(new Date()).toUTC().startOf('second');
  assert(date.isValid);

  return date.toISO({
    suppressMilliseconds: true,
  });
}

/**
 * Get the next execution date from a schedule, which should be either:
 *
 * - An ISO 8601 date string, or
 * - An ISO 8601 duration string, or
 * - A cron expression.
 *
 * @param schedule - The schedule of the event.
 * @returns The parsed ISO 8601 date at which the event should be executed.
 */
export function getExecutionDate(schedule: string) {
  try {
    const date = DateTime.fromISO(schedule);
    if (date.isValid) {
      return date.toUTC().startOf('second').toISO({
        suppressMilliseconds: true,
      });
    }

    const duration = Duration.fromISO(schedule);
    if (duration.isValid) {
      const validatedDuration = getDuration(duration);
      return DateTime.now().toUTC().plus(validatedDuration).toISO({
        suppressMilliseconds: true,
      });
    }

    const parsed = parseExpression(schedule, { utc: true });
    const next = parsed.next();
    const nextDate = DateTime.fromJSDate(next.toDate());
    assert(nextDate.isValid);

    return nextDate.toUTC().toISO({
      suppressMilliseconds: true,
    });
  } catch {
    throw new Error(
      `Unable to parse "${schedule}" as ISO 8601 date, ISO 8601 duration, or cron expression.`,
    );
  }
}
