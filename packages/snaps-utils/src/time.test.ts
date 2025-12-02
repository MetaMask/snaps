import { create, is } from '@metamask/superstruct';

import { ISO8601DurationStruct, toCensoredISO8601String } from './time';

describe('ISO8601DurationStruct', () => {
  it('should return true for a valid ISO 8601 duration', () => {
    const value = 'P3Y6M4DT12H30M5S';
    expect(is(value, ISO8601DurationStruct)).toBe(true);
  });

  it('should return false for an invalid ISO 8601 duration', () => {
    const value = 'Millisecond';
    expect(is(value, ISO8601DurationStruct)).toBe(false);
  });

  it('should return an error message for invalid ISO 8601 duration', () => {
    const value = '1Millisecond';
    expect(() => create(value, ISO8601DurationStruct)).toThrow(
      'Not a valid ISO 8601 duration',
    );
  });
});

describe('toCensoredISO8601String', () => {
  it('returns ISO dates as-is with no millisecond precision', () => {
    expect(toCensoredISO8601String('2025-05-21T13:25:25Z')).toBe(
      '2025-05-21T13:25:25Z',
    );
  });

  it('removes millisecond precision', () => {
    expect(toCensoredISO8601String('2025-05-21T13:25:21.500Z')).toBe(
      '2025-05-21T13:25:21Z',
    );
  });
});
