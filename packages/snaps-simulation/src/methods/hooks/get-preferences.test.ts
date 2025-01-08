import { getMockOptions } from '../../test-utils/options';
import { getGetPreferencesMethodImplementation } from './get-preferences';

describe('getGetPreferencesMethodImplementation', () => {
  it('returns the implementation of the `getPreferences` hook', async () => {
    const fn = getGetPreferencesMethodImplementation(
      getMockOptions({
        locale: 'en',
      }),
    );

    expect(fn()).toStrictEqual({
      currency: 'usd',
      locale: 'en',
      hideBalances: false,
    });
  });

  it('returns the implementation of the `getPreferences` hook for a different locale', async () => {
    const fn = getGetPreferencesMethodImplementation(
      getMockOptions({
        locale: 'nl',
      }),
    );

    expect(fn()).toStrictEqual({
      currency: 'usd',
      locale: 'nl',
      hideBalances: false,
    });
  });

  it('returns the implementation of the `getPreferences` hook for a different currency', async () => {
    const fn = getGetPreferencesMethodImplementation(
      getMockOptions({
        currency: 'dkk',
      }),
    );

    expect(fn()).toStrictEqual({
      currency: 'dkk',
      locale: 'en',
      hideBalances: false,
    });
  });

  it('returns the implementation of the `getPreferences` hook for hidden balances', async () => {
    const fn = getGetPreferencesMethodImplementation(
      getMockOptions({
        hideBalances: true,
      }),
    );

    expect(fn()).toStrictEqual({
      currency: 'usd',
      locale: 'en',
      hideBalances: true,
    });
  });
});
