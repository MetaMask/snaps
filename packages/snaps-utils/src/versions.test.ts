import { getSnapPrefix } from './snaps';
import { SnapIdPrefixes } from './types';
import {
  DEFAULT_REQUESTED_SNAP_VERSION,
  getTargetVersion,
  gtVersion,
  isValidSemVerRange,
  resolveVersionRange,
  satisfiesVersionRange,
  SemVerRange,
  SemVerVersion,
} from './versions';

function v(value: string[]): SemVerVersion[];
function v(value: string): SemVerVersion;
function v(value: string | string[]): SemVerVersion | SemVerVersion[] {
  return value as any;
}

function r(value: string): SemVerRange {
  return value as SemVerRange;
}

describe('resolveVersion', () => {
  it('defaults "latest" to DEFAULT_REQUESTED_SNAP_VERSION', () => {
    expect(resolveVersionRange('latest')).toBe(DEFAULT_REQUESTED_SNAP_VERSION);
  });

  it('defaults an undefined version to DEFAULT_REQUESTED_SNAP_VERSION', () => {
    expect(resolveVersionRange(undefined)).toBe(DEFAULT_REQUESTED_SNAP_VERSION);
  });

  it('returns the requested version for everything else', () => {
    expect(resolveVersionRange('1.2.3')).toBe('1.2.3');
  });

  it.each([null, 1, {}, Error])('throws on invalid input', (value) => {
    expect(() => resolveVersionRange(value)).toThrow('asd');
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
