import { rootRealmGlobal } from '../globalObject';
import date from './date';

describe('Date endowment', () => {
  beforeEach(() => {
    jest.useFakeTimers().setSystemTime(new Date('2023-01-01'));
  });

  afterAll(() => {
    jest.useRealTimers();
  });

  it('has expected properties', () => {
    expect(date).toMatchObject({
      names: ['Date'],
      factory: expect.any(Function),
    });
  });

  it('returns Date from rootRealmGlobal', () => {
    const { Date } = date.factory();
    expect(Date.UTC).toStrictEqual(rootRealmGlobal.Date.UTC);
  });

  describe('constructor', () => {
    it('does not return the original constructor', () => {
      const { Date } = date.factory();
      const actual = new rootRealmGlobal.Date();
      const newDate = new Date();
      expect(newDate.getTime()).not.toBe(actual.getTime());
    });
  });

  describe('now', () => {
    it('does not return the original Date.now', () => {
      const { Date } = date.factory();
      expect(Date.now).not.toStrictEqual(rootRealmGlobal.Date.now);
    });
  });
});
