import {
  getCronjobSpecificationSchedule,
  getExecutionDate,
  recoverEventDate,
} from './utils';

jest.useFakeTimers();
jest.setSystemTime(1747994147500);

describe('getCronjobSpecificationSchedule', () => {
  it('returns the duration if specified', () => {
    const specification = {
      duration: 'PT1H',
      request: { method: 'foo' },
    };

    expect(getCronjobSpecificationSchedule(specification)).toBe('PT1H');
  });

  it('returns the expression if no duration is specified', () => {
    const specification = {
      expression: '0 0 * * *',
      request: { method: 'foo' },
    };

    expect(getCronjobSpecificationSchedule(specification)).toBe('0 0 * * *');
  });
});

describe('getExecutionDate', () => {
  it('parses an ISO 8601 date', () => {
    expect(getExecutionDate('2025-05-24T09:55:47Z')).toBe(
      '2025-05-24T09:55:47Z',
    );
    expect(getExecutionDate('2025-05-24T09:55:47+00:00')).toBe(
      '2025-05-24T09:55:47Z',
    );
    expect(getExecutionDate('2025-05-24T09:55:47+01:00')).toBe(
      '2025-05-24T08:55:47Z',
    );
  });

  it('parses an ISO 8601 duration', () => {
    expect(getExecutionDate('P1Y')).toBe('2026-05-23T09:55:47.500Z');
    expect(getExecutionDate('PT1S')).toBe('2025-05-23T09:55:48.500Z');
    expect(getExecutionDate('PT0S')).toBe('2025-05-23T09:55:48.500Z');
  });

  it('parses a cron expression', () => {
    expect(getExecutionDate('0 0 * * *')).toBe('2025-05-24T00:00:00.000Z');
    expect(getExecutionDate('0 0 1 * *')).toBe('2025-06-01T00:00:00.000Z');
    expect(getExecutionDate('0 0 1 1 *')).toBe('2026-01-01T00:00:00.000Z');
    expect(getExecutionDate('0 0 1 1 mon')).toBe('2026-01-01T00:00:00.000Z');
  });

  it('throws an error for invalid input', () => {
    expect(() => getExecutionDate('invalid')).toThrow(
      'Unable to parse "invalid" as ISO 8601 date, ISO 8601 duration, or cron expression.',
    );
    expect(() => getExecutionDate('2025-05-23T09:55:47Z+01:00')).toThrow(
      'Unable to parse "2025-05-23T09:55:47Z+01:00" as ISO 8601 date, ISO 8601 duration, or cron expression.',
    );
    expect(() => getExecutionDate('P1Y2M3D4H')).toThrow(
      'Unable to parse "P1Y2M3D4H" as ISO 8601 date, ISO 8601 duration, or cron expression.',
    );
    expect(() => getExecutionDate('100 * * * * *')).toThrow(
      'Unable to parse "100 * * * * *" as ISO 8601 date, ISO 8601 duration, or cron expression.',
    );
  });

  it('throws an error for dates in the past', () => {
    expect(() => getExecutionDate('2020-01-01T00:00:00Z')).toThrow(
      'Cannot schedule an event in the past.',
    );

    expect(() =>
      getExecutionDate(new Date(Date.now() + 100).toISOString()),
    ).toThrow('Cannot schedule an event in the past.');
  });
});

describe('recoverEventDate', () => {
  it('returns an absolute ISO 8601 date', () => {
    expect(
      recoverEventDate({
        schedule: '2025-05-24T09:55:47Z',
        scheduledAt: '2025-05-23T09:00:00.000Z',
        recurring: false,
      }),
    ).toBe('2025-05-24T09:55:47Z');

    expect(
      recoverEventDate({
        schedule: '2025-05-24T09:55:47+00:00',
        scheduledAt: '2025-05-23T09:00:00.000Z',
        recurring: false,
      }),
    ).toBe('2025-05-24T09:55:47Z');

    expect(
      recoverEventDate({
        schedule: '2025-05-24T09:55:47+01:00',
        scheduledAt: '2025-05-23T09:00:00.000Z',
        recurring: false,
      }),
    ).toBe('2025-05-24T08:55:47Z');
  });

  it('truncates an absolute ISO 8601 date to the second', () => {
    expect(
      recoverEventDate({
        schedule: '2025-05-24T09:55:47.999Z',
        scheduledAt: '2025-05-23T09:00:00.000Z',
        recurring: false,
      }),
    ).toBe('2025-05-24T09:55:47Z');
  });

  it('ignores `scheduledAt` and `recurring` for an absolute ISO 8601 date', () => {
    expect(
      recoverEventDate({
        schedule: '2025-05-24T09:55:47Z',
        scheduledAt: 'invalid',
        recurring: true,
      }),
    ).toBe('2025-05-24T09:55:47Z');
  });

  it('returns an absolute ISO 8601 date in the past without throwing', () => {
    expect(() =>
      recoverEventDate({
        schedule: '2020-01-01T00:00:00Z',
        scheduledAt: '2019-12-01T00:00:00.000Z',
        recurring: false,
      }),
    ).not.toThrow();

    expect(
      recoverEventDate({
        schedule: '2020-01-01T00:00:00Z',
        scheduledAt: '2019-12-01T00:00:00.000Z',
        recurring: false,
      }),
    ).toBe('2020-01-01T00:00:00Z');

    expect(
      recoverEventDate({
        schedule: new Date(Date.now() - 100).toISOString(),
        scheduledAt: '2025-05-23T09:00:00.000Z',
        recurring: false,
      }),
    ).toBe('2025-05-23T09:55:47Z');
  });

  it('anchors an ISO 8601 duration on `scheduledAt` for a one-shot event', () => {
    expect(
      recoverEventDate({
        schedule: 'PT1H',
        scheduledAt: '2025-05-23T09:00:00.000Z',
        recurring: false,
      }),
    ).toBe('2025-05-23T10:00:00.000Z');

    expect(
      recoverEventDate({
        schedule: 'P1Y',
        scheduledAt: '2025-05-23T09:00:00.000Z',
        recurring: false,
      }),
    ).toBe('2026-05-23T09:00:00.000Z');

    expect(
      recoverEventDate({
        schedule: 'PT1H',
        scheduledAt: '2025-05-23T11:00:00+02:00',
        recurring: false,
      }),
    ).toBe('2025-05-23T10:00:00.000Z');
  });

  it('preserves the milliseconds of `scheduledAt` for a one-shot event', () => {
    expect(
      recoverEventDate({
        schedule: 'PT1H',
        scheduledAt: '2025-05-23T09:00:00.123Z',
        recurring: false,
      }),
    ).toBe('2025-05-23T10:00:00.123Z');
  });

  it('returns a date in the past for an overdue one-shot event', () => {
    expect(
      recoverEventDate({
        schedule: 'PT1H',
        scheduledAt: '2020-01-01T00:00:00Z',
        recurring: false,
      }),
    ).toBe('2020-01-01T01:00:00.000Z');
  });

  it('anchors an ISO 8601 duration on the current time for a recurring event', () => {
    expect(
      recoverEventDate({
        schedule: 'PT1H',
        scheduledAt: '2025-05-23T09:00:00.000Z',
        recurring: true,
      }),
    ).toBe('2025-05-23T10:55:47.500Z');

    expect(
      recoverEventDate({
        schedule: 'P1Y',
        scheduledAt: '2025-05-23T09:00:00.000Z',
        recurring: true,
      }),
    ).toBe('2026-05-23T09:55:47.500Z');
  });

  it('ignores an unusable `scheduledAt` for a recurring event', () => {
    expect(
      recoverEventDate({
        schedule: 'PT1H',
        scheduledAt: 'invalid',
        recurring: true,
      }),
    ).toBe('2025-05-23T10:55:47.500Z');
  });

  it('rounds a duration of less than one second up to one second', () => {
    expect(
      recoverEventDate({
        schedule: 'PT0S',
        scheduledAt: '2025-05-23T09:00:00.000Z',
        recurring: false,
      }),
    ).toBe('2025-05-23T09:00:01.000Z');

    expect(
      recoverEventDate({
        schedule: 'PT0.5S',
        scheduledAt: '2025-05-23T09:00:00.000Z',
        recurring: false,
      }),
    ).toBe('2025-05-23T09:00:01.000Z');

    expect(
      recoverEventDate({
        schedule: 'PT0S',
        scheduledAt: '2025-05-23T09:00:00.000Z',
        recurring: true,
      }),
    ).toBe('2025-05-23T09:55:48.500Z');
  });

  it('parses a cron expression', () => {
    expect(
      recoverEventDate({
        schedule: '0 0 * * *',
        scheduledAt: '2025-05-23T09:00:00.000Z',
        recurring: true,
      }),
    ).toBe('2025-05-24T00:00:00.000Z');

    expect(
      recoverEventDate({
        schedule: '*/5 * * * *',
        scheduledAt: '2025-05-23T09:00:00.000Z',
        recurring: true,
      }),
    ).toBe('2025-05-23T10:00:00.000Z');

    expect(
      recoverEventDate({
        schedule: '0 0 1 1 *',
        scheduledAt: '2025-05-23T09:00:00.000Z',
        recurring: true,
      }),
    ).toBe('2026-01-01T00:00:00.000Z');
  });

  it('ignores `scheduledAt` for a cron expression', () => {
    expect(
      recoverEventDate({
        schedule: '0 0 * * *',
        scheduledAt: 'invalid',
        recurring: false,
      }),
    ).toBe('2025-05-24T00:00:00.000Z');
  });

  it('returns `undefined` for an unparseable schedule', () => {
    expect(
      recoverEventDate({
        schedule: 'invalid',
        scheduledAt: '2025-05-23T09:00:00.000Z',
        recurring: false,
      }),
    ).toBeUndefined();

    expect(
      recoverEventDate({
        schedule: '2025-05-23T09:55:47Z+01:00',
        scheduledAt: '2025-05-23T09:00:00.000Z',
        recurring: false,
      }),
    ).toBeUndefined();

    expect(
      recoverEventDate({
        schedule: 'P1Y2M3D4H',
        scheduledAt: '2025-05-23T09:00:00.000Z',
        recurring: false,
      }),
    ).toBeUndefined();

    expect(
      recoverEventDate({
        schedule: '100 * * * * *',
        scheduledAt: '2025-05-23T09:00:00.000Z',
        recurring: false,
      }),
    ).toBeUndefined();

    expect(
      recoverEventDate({
        schedule: '0 0 30 2 *',
        scheduledAt: '2025-05-23T09:00:00.000Z',
        recurring: false,
      }),
    ).toBeUndefined();
  });

  it('does not throw for an unparseable schedule', () => {
    expect(() =>
      recoverEventDate({
        schedule: 'invalid',
        scheduledAt: 'invalid',
        recurring: false,
      }),
    ).not.toThrow();
  });

  it('returns `undefined` when a duration cannot be anchored', () => {
    expect(
      recoverEventDate({
        schedule: 'PT1H',
        scheduledAt: 'invalid',
        recurring: false,
      }),
    ).toBeUndefined();

    expect(
      recoverEventDate({
        schedule: 'PT1H',
        scheduledAt: '',
        recurring: false,
      }),
    ).toBeUndefined();
  });

  it.each(['', '   ', '\t'])(
    'returns undefined for the empty schedule %j',
    (schedule) => {
      // `cron-parser` accepts these and reads them as `* * * * *`. Recovering
      // such an event would resurrect it as a once-a-minute job forever
      // instead of reporting it unrecoverable.
      expect(
        recoverEventDate({
          schedule,
          scheduledAt: '2025-05-23T09:55:47.500Z',
          recurring: true,
        }),
      ).toBeUndefined();
    },
  );
});
