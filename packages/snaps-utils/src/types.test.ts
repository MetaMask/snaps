import { enums, is, literal } from 'superstruct';

import { getPackageJson } from './test-utils';
import {
  assertIsNpmSnapPackageJson,
  isNpmSnapPackageJson,
  isValidUrl,
  uri,
} from './types';

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

describe.each([
  isValidUrl,
  (value: unknown, opts?: any) => is(value, uri(opts)),
])('uri', (testedFn) => {
  it.each([
    'npm:foo-bar',
    'http://asd.com',
    'https://dsa.com/foo',
    'http://dsa.com/foo?asd=5&dsa=6#bar',
    'npm:foo/bar?asd',
    'local:asd.com',
    'http://asd@asd.com',
    'http://asd:foo@asd.com',
    new URL('http://asd.com'),
  ])('validates correct uri', (value) => {
    expect(testedFn(value)).toBe(true);
  });

  it.each([5, 'asd', undefined, null, {}, uri, URL])(
    'invalidates invalid uri',
    (value) => {
      expect(testedFn(value)).toBe(false);
    },
  );

  it('takes additional constraints', () => {
    const constraints = {
      protocol: enums(['foo:', 'bar:']),
      hash: literal('#hello'),
    };
    expect(testedFn('foo://asd.com/#hello', constraints)).toBe(true);
    expect(testedFn('foo://asd.com/', constraints)).toBe(false);
    expect(testedFn('http://asd.com/#hello', constraints)).toBe(false);
  });
});
