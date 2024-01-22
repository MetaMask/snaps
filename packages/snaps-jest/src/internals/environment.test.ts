import { getEnvironment } from './environment';

describe('getEnvironment', () => {
  it('throws an error if the environment is not configured', () => {
    expect(() => getEnvironment()).toThrow(
      'Snaps environment not found. Make sure you have configured the environment correctly.',
    );
  });

  it('returns the environment if it is configured', () => {
    const environment = { foo: 'bar' };

    Object.defineProperty(global, 'snapsEnvironment', {
      value: environment,
    });

    expect(getEnvironment()).toBe(environment);
  });
});
