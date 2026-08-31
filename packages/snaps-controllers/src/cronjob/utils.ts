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
  const date = DateTime.fromISO(schedule, { setZone: true });
  if (date.isValid) {
    const now = Date.now();

    // We round to the nearest second to avoid milliseconds in the output.
    const roundedDate = date.toUTC().startOf('second');
    if (roundedDate.toMillis() < now) {
      throw new Error('Cannot schedule an event in the past.');
    }

    return roundedDate.toISO({
      suppressMilliseconds: true,
    });
  }

  const duration = Duration.fromISO(schedule);
  if (duration.isValid) {
    // This ensures the duration is at least 1 second.
    const validatedDuration = getDuration(duration);
    return DateTime.now().toUTC().plus(validatedDuration).toISO();
  }

  try {
    const parsed = parseExpression(schedule, { utc: true });
    const next = parsed.next();
    const nextDate = DateTime.fromJSDate(next.toDate());
    assert(nextDate.isValid);

    return nextDate.toUTC().toISO();
  } catch {
    throw new Error(
      `Unable to parse "${schedule}" as ISO 8601 date, ISO 8601 duration, or cron expression.`,
    );
  }
}

/**
 * Recover an event's next execution date when the stored date is missing.
 *
 * This is deliberately NOT `getExecutionDate`. That function is impure for
 * durations — it returns `now + duration`, so calling it on every read would
 * push a `PT30S` event forever into the future and it would never fire — and
 * it throws for an absolute date that has already passed. Recovery needs the
 * opposite of both: anchor on `scheduledAt` rather than on now, and return
 * `undefined` rather than throw, so an unrecoverable event can be cancelled
 * instead of taking the caller down with it.
 *
 * Recovery is possible at all because `schedule` and `scheduledAt` are written
 * once when the event is added and never mutated afterwards. A client that
 * stores dates separately can lose the date without losing either of them.
 *
 * @param event - The event whose date is missing.
 * @param event.schedule - The cron expression, ISO 8601 duration, or ISO 8601
 * date that defines the event's schedule.
 * @param event.scheduledAt - The ISO 8601 date at which the event was added.
 * @param event.recurring - Whether the event repeats.
 * @returns The recovered ISO 8601 date, or `undefined` if the schedule cannot
 * be parsed.
 */
export function recoverEventDate({
  schedule,
  scheduledAt,
  recurring,
}: {
  schedule: string;
  scheduledAt: string;
  recurring: boolean;
}): string | undefined {
  // An absolute date is its own answer, whether or not it has passed. A past
  // date means the event was due while the date was missing, and the caller
  // already executes past-due events on startup.
  const absolute = DateTime.fromISO(schedule, { setZone: true });
  if (absolute.isValid) {
    return absolute.toUTC().startOf('second').toISO({
      suppressMilliseconds: true,
    });
  }

  const duration = Duration.fromISO(schedule);
  if (duration.isValid) {
    // A one-shot's original date is exactly reconstructible. A recurring one's
    // is not — `scheduledAt` is the creation time and never moves, so after N
    // intervals it is long stale — but a recurring event only needs a valid
    // next date, and losing at most one interval of phase is harmless.
    const anchor = recurring
      ? DateTime.now()
      : DateTime.fromISO(scheduledAt, { setZone: true });

    if (!anchor.isValid) {
      return undefined;
    }

    return anchor.toUTC().plus(getDuration(duration)).toISO();
  }

  try {
    const parsed = parseExpression(schedule, { utc: true });
    const next = DateTime.fromJSDate(parsed.next().toDate());
    return next.isValid ? next.toUTC().toISO() : undefined;
  } catch {
    return undefined;
  }
}
