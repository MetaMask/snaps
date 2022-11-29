import { getPackageJson } from './test-utils';
import { assertIsNpmSnapPackageJson, isNpmSnapPackageJson } from './types';

describe('isNpmSnapPackageJson', () => {
  it('returns true for a valid package.json', () => {
    expect(isNpmSnapPackageJson(getPackageJson())).toBe(true);
  });

  it.each([
    true,
    false,
    null,
    undefined,
    0,
    1,
    '',
    'foo',
    [],
    {},
    { name: 'foo' },
    { version: '1.0.0' },
    getPackageJson({ name: 'foo bar' }),
  ])('returns false for an invalid package.json', (value) => {
    expect(isNpmSnapPackageJson(value)).toBe(false);
  });
});

describe('assertIsNpmSnapPackageJson', () => {
  it('does not throw for a valid package.json', () => {
    expect(() => assertIsNpmSnapPackageJson(getPackageJson())).not.toThrow();
  });

  it.each([
    true,
    false,
    null,
    undefined,
    0,
    1,
    '',
    'foo',
    [],
    {},
    { name: 'foo' },
    { version: '1.0.0' },
    getPackageJson({ name: 'foo bar' }),
  ])('throws for an invalid package.json', (value) => {
    expect(() => assertIsNpmSnapPackageJson(value)).toThrow(
      '"package.json" is invalid:',
    );
  });
});
