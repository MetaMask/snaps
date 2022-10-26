import {
  assertIsNpmSnapPackageJson,
  assertIsSnapManifest,
  isNpmSnapPackageJson,
  isSnapManifest,
} from './types';
import { getPackageJson, getSnapManifest } from './test-utils';

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

describe('isSnapManifest', () => {
  it('returns true for a valid snap manifest', () => {
    expect(isSnapManifest(getSnapManifest())).toBe(true);
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
    getSnapManifest({ version: 'foo bar' }),
  ])('returns false for an invalid snap manifest', (value) => {
    expect(isSnapManifest(value)).toBe(false);
  });
});

describe('assertIsSnapManifest', () => {
  it('does not throw for a valid snap manifest', () => {
    expect(() => assertIsSnapManifest(getSnapManifest())).not.toThrow();
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
    getSnapManifest({ version: 'foo bar' }),
  ])('throws for an invalid snap manifest', (value) => {
    expect(() => assertIsSnapManifest(value)).toThrow(
      '"snap.manifest.json" is invalid:',
    );
  });
});
