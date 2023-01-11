import { rootRealmGlobal } from '../globalObject';
import date from './date';

describe('Date endowment', () => {
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

  describe('now', () => {
    it('does not return the original Date.now', () => {
      const { Date } = date.factory();
      expect(Date.now).not.toStrictEqual(rootRealmGlobal.Date.now);
    });
  });
});
