import { executeLockdown } from './lockdown';
// eslint-disable-next-line import/no-unassigned-import
import 'ses';

describe('executeLockdown', () => {
  // cleanup
  const cachedGlobal = { ...globalThis };
  afterAll(() => {
    Object.assign(globalThis, cachedGlobal);
  });

  it('should successfully lockdown the global environment', () => {
    Object.defineProperty(globalThis.process, 'domain', {
      value: null,
      configurable: false,
      writable: false,
      enumerable: false,
    });
    expect(() => executeLockdown()).not.toThrow();
  });

  it('should throw an error if there is a problem with lockdown', () => {
    jest.spyOn(global.console, 'error').mockImplementation();
    expect(() => executeLockdown()).toThrow(
      'Already locked down at TypeError: Prior lockdown (SES_ALREADY_LOCKED_DOWN) (SES_ALREADY_LOCKED_DOWN)',
    );
  });
});
