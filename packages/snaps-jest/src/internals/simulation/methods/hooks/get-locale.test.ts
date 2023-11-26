import { getMockOptions } from '../../../../test-utils/options';
import { getGetLocaleMethodImplementation } from './get-locale';

describe('getGetLocaleMethodImplementation', () => {
  it('returns the implementation of the `getLocale` hook', async () => {
    const fn = getGetLocaleMethodImplementation(
      getMockOptions({
        locale: 'en',
      }),
    );

    expect(await fn()).toBe('en');
  });

  it('returns the implementation of the `getLocale` hook for a different locale', async () => {
    const fn = getGetLocaleMethodImplementation(
      getMockOptions({
        locale: 'nl',
      }),
    );

    expect(await fn()).toBe('nl');
  });
});
