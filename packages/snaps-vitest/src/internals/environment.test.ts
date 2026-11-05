import { afterEach, describe, expect, it } from 'vitest';

import { getEnvironment } from './environment';

describe('getEnvironment', () => {
  const originalEnvironment = globalThis.snapsEnvironment;

  afterEach(() => {
    if (typeof originalEnvironment === 'undefined') {
      Reflect.deleteProperty(globalThis, 'snapsEnvironment');
      return;
    }

    Object.defineProperty(globalThis, 'snapsEnvironment', {
      value: originalEnvironment,
      configurable: true,
    });
  });

  it('throws an error if the environment is not configured', () => {
    Reflect.deleteProperty(globalThis, 'snapsEnvironment');

    expect(() => getEnvironment()).toThrow(
      'Snaps environment not found. Make sure you have configured the environment correctly.',
    );
  });

  it('returns the environment if it is configured', () => {
    const environment = { foo: 'bar' };

    Object.defineProperty(globalThis, 'snapsEnvironment', {
      value: environment,
      configurable: true,
    });

    expect(getEnvironment()).toBe(environment);
  });
});
