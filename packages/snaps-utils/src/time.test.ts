import { create, is } from '@metamask/superstruct';
import { DateTime } from 'luxon';

import { Iso8601DateStruct, Iso8601DurationStruct } from './time';

describe('Iso8601dateStruct', () => {
  it('should return true for a valid ISO 8601 date', () => {
    const value = DateTime.now().toISO();
    expect(is(value, Iso8601DateStruct)).toBe(true);
  });

  it('should return false for an invalid ISO 8601 date', () => {
    const value = 'Mon Mar 31 2025';
    expect(is(value, Iso8601DateStruct)).toBe(false);
  });

  it('should return false for an ISO 8601 date without timezone information', () => {
    const value = '2025-03-31T12:00:00';
    expect(is(value, Iso8601DateStruct)).toBe(false);
  });

  it('should return an error message for invalid ISO 8601 date', () => {
    const value = 'Mon Mar 31 2025';
    expect(() => create(value, Iso8601DateStruct)).toThrow(
      'Not a valid ISO 8601 date',
    );
  });

  it('should return an error message for ISO 8601 date without timezone information', () => {
    const value = '2025-03-31T12:00:00';
    expect(() => create(value, Iso8601DateStruct)).toThrow(
      'ISO 8601 date must have timezone information',
    );
  });
});

describe('Iso8601DurationStruct', () => {
  it('should return true for a valid ISO 8601 duration', () => {
    const value = 'P3Y6M4DT12H30M5S';
    expect(is(value, Iso8601DurationStruct)).toBe(true);
  });

  it('should return false for an invalid ISO 8601 duration', () => {
    const value = 'Millisecond';
    expect(is(value, Iso8601DurationStruct)).toBe(false);
  });

  it('should return an error message for invalid ISO 8601 duration', () => {
    const value = '1Millisecond';
    expect(() => create(value, Iso8601DurationStruct)).toThrow(
      'Not a valid ISO 8601 duration',
    );
  });
});
