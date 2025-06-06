import { getCronjobSpecificationSchedule, getExecutionDate } from './utils';

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
