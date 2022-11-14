import { assert } from '@metamask/utils';
import { getSnapPrefix } from './snaps';
import { SnapIdPrefixes } from './types';
import {
  assertIsSemVerRange,
  assertIsSemVerVersion,
  DEFAULT_REQUESTED_SNAP_VERSION,
  getTargetVersion,
  gtVersion,
  isValidSemVerRange,
  isValidSemVerVersion,
  resolveVersionRange,
  satisfiesVersionRange,
  SemVerRange,
  SemVerVersion,
} from './versions';

function v(value: string[]): SemVerVersion[];
function v(value: string): SemVerVersion;
/**
 * Utility to cast string to version.
 *
 * @param value - String to cast.
 * @returns The same string with different type.
 */
function v(value: string | string[]): SemVerVersion | SemVerVersion[] {
  return value as any;
}

/**
 * Utility to cast string to range.
 *
 * @param value - String to cast.
 * @returns The same string with different type.
 */
function r(value: string): SemVerRange {
  return value as SemVerRange;
}

describe('resolveVersion', () => {
  it('defaults "latest" to DEFAULT_REQUESTED_SNAP_VERSION', () => {
    expect(resolveVersionRange('latest')[1]).toBe(
      DEFAULT_REQUESTED_SNAP_VERSION,
    );
  });

  it('defaults an undefined version to DEFAULT_REQUESTED_SNAP_VERSION', () => {
    expect(resolveVersionRange(undefined)[1]).toBe(
      DEFAULT_REQUESTED_SNAP_VERSION,
    );
  });

  it('returns the requested version for everything else', () => {
    expect(resolveVersionRange('1.2.3')[1]).toBe('1.2.3');
  });

  it.each([null, 1, {}, Error])('returns error on invalid input', (value) => {
    const [err, result] = resolveVersionRange(value);
    assert(err !== undefined);
    expect(err.message).toMatch('Expected a string, but received: ');
    expect(result).toBeUndefined();
  });
});

describe('getSnapPrefix', () => {
  it('detects npm prefix', () => {
    expect(getSnapPrefix('npm:example-snap')).toBe(SnapIdPrefixes.npm);
  });

  it('detects local prefix', () => {
    expect(getSnapPrefix('local:fooSnap')).toBe(SnapIdPrefixes.local);
  });

  it('throws in case of invalid prefix', () => {
    expect(() => getSnapPrefix('foo:fooSnap')).toThrow(
      'Invalid or no prefix found for "foo:fooSnap"',
    );
  });
});

describe('assertIsSemVerVersion', () => {
  it('shows descriptive errors', () => {
    expect(() => assertIsSemVerVersion('>1.2')).toThrow(
      'Expected SemVer version, got',
    );
  });
});

describe('assertIsSemVerRange', () => {
  it('shows descriptive errors', () => {
    expect(() => assertIsSemVerRange('.')).toThrow(
      'Expected SemVer range, got',
    );
  });
});

describe('isValidSemVerVersion', () => {
  it.each([
    'asd',
    '()()',
    '..',
    '.',
    '.1',
    null,
    undefined,
    2,
    true,
    {},
    Error,
  ])('rejects invalid version', (version) => {
    expect(isValidSemVerVersion(version)).toBe(false);
  });

  it('supports normal version ranges', () => {
    expect(isValidSemVerVersion('1.5.0')).toBe(true);
  });

  it('supports pre-release versions', () => {
    expect(isValidSemVerVersion('1.0.0-beta.1')).toBe(true);
  });
});

describe('isValidSemVerRange', () => {
  it('supports *', () => {
    expect(isValidSemVerRange('*')).toBe(true);
  });

  it('supports normal version ranges', () => {
    expect(isValidSemVerRange('^1.2.3')).toBe(true);
    expect(isValidSemVerRange('1.5.0')).toBe(true);
  });

  it('supports pre-release versions', () => {
    expect(isValidSemVerRange('1.0.0-beta.1')).toBe(true);
    expect(isValidSemVerRange('^1.0.0-beta.1')).toBe(true);
  });

  it('rejects non strings', () => {
    expect(isValidSemVerRange(null)).toBe(false);
    expect(isValidSemVerRange(undefined)).toBe(false);
    expect(isValidSemVerRange(2)).toBe(false);
    expect(isValidSemVerRange(true)).toBe(false);
    expect(isValidSemVerRange({})).toBe(false);
  });

  it.each(['asd', '()()(', '..', '.', '1.'])(
    'rejects invalid ranges',
    (range) => {
      expect(isValidSemVerRange(range)).toBe(false);
    },
  );
});

describe('gtVersion', () => {
  it('supports regular versions', () => {
    expect(gtVersion(v('1.2.3'), v('1.0.0'))).toBe(true);
    expect(gtVersion(v('2.0.0'), v('1.0.0'))).toBe(true);
    expect(gtVersion(v('1.0.0'), v('1.2.3'))).toBe(false);
    expect(gtVersion(v('1.0.0'), v('2.0.0'))).toBe(false);
  });

  it('supports pre-release versions', () => {
    expect(gtVersion(v('1.0.0-beta.2'), v('1.0.0-beta.1'))).toBe(true);
    expect(gtVersion(v('1.0.0-beta.2'), v('1.2.3'))).toBe(false);
    expect(gtVersion(v('1.0.0'), v('1.0.0-beta.2'))).toBe(true);
    expect(gtVersion(v('1.2.3-beta.1'), v('1.0.0'))).toBe(true);
    expect(gtVersion(v('1.2.3-beta.1'), v('1.2.3-alpha.2'))).toBe(true);
  });
});

describe('getTargetVersion', () => {
  it('supports *', () => {
    expect(getTargetVersion(v(['1.2.3', '3.0.0']), r('*'))).toBe('3.0.0');
  });

  it('supports pre-release versions', () => {
    expect(getTargetVersion(v(['1.0.0-beta.1']), r('*'))).toBe('1.0.0-beta.1');
    expect(getTargetVersion(v(['1.0.0-beta.1', '1.0.0-beta.2']), r('*'))).toBe(
      '1.0.0-beta.2',
    );

    expect(
      getTargetVersion(v(['1.0.0-beta.1', '1.0.0-beta.2']), r('^1.0.0-beta.1')),
    ).toBe('1.0.0-beta.2');

    expect(getTargetVersion(v(['1.0.0-alpha.2', '1.0.0-beta.1']), r('*'))).toBe(
      '1.0.0-beta.1',
    );

    expect(getTargetVersion(v(['0.9.0', '1.0.0-alpha.0']), r('*'))).toBe(
      '0.9.0',
    );
  });

  it("doesn't return pre-release versions by default", () => {
    expect(
      getTargetVersion(v(['1.0.0-beta.1', '1.0.0', '1.2.3']), r('*')),
    ).toBe('1.2.3');

    expect(
      getTargetVersion(v(['1.0.0-beta.1', '1.0.0', '1.2.3']), r('^1.0.0')),
    ).toBe('1.2.3');

    expect(getTargetVersion(v(['1.0.0-beta.1', '1.0.0']), r('*'))).toBe(
      '1.0.0',
    );
  });
});

describe('satisfiesVersionRange', () => {
  it('supports *', () => {
    expect(satisfiesVersionRange(v('3.0.0'), r('*'))).toBe(true);
  });

  it('supports exact versions', () => {
    expect(satisfiesVersionRange(v('1.0.0-beta.1'), r('1.0.0-beta.1'))).toBe(
      true,
    );
    expect(satisfiesVersionRange(v('1.0.0'), r('1.0.0'))).toBe(true);
    expect(satisfiesVersionRange(v('1.2.3'), r('1.0.0'))).toBe(false);
  });

  it('supports non-exact version ranges', () => {
    expect(satisfiesVersionRange(v('1.2.3'), r('^1.0.0'))).toBe(true);
    expect(satisfiesVersionRange(v('2.0.0'), r('^1.0.0'))).toBe(false);
  });

  it('pre-releases can satisfy version range', () => {
    expect(satisfiesVersionRange(v('1.0.0-beta.1'), r('*'))).toBe(true);
    expect(satisfiesVersionRange(v('1.0.0-beta.1'), r('^1.0.0'))).toBe(false);
  });
});
