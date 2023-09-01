import type { SemVerRange, SemVerVersion } from '@metamask/utils';
import { assert } from '@metamask/utils';

import { getSnapPrefix } from './snaps';
import { SnapIdPrefixes } from './types';
import {
  DEFAULT_REQUESTED_SNAP_VERSION,
  getTargetVersion,
  resolveVersionRange,
} from './versions';

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
    const [error, result] = resolveVersionRange(value);
    assert(error !== undefined);
    expect(error.message).toMatch('Expected a string, but received: ');
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

describe('getTargetVersion', () => {
  it('supports *', () => {
    expect(
      getTargetVersion(
        ['1.2.3', '3.0.0'] as SemVerVersion[],
        '*' as SemVerRange,
      ),
    ).toBe('3.0.0');
  });

  it('supports pre-release versions', () => {
    expect(
      getTargetVersion(['1.0.0-beta.1'] as SemVerVersion[], '*' as SemVerRange),
    ).toBe('1.0.0-beta.1');

    expect(
      getTargetVersion(
        ['1.0.0-beta.1', '1.0.0-beta.2'] as SemVerVersion[],
        '*' as SemVerRange,
      ),
    ).toBe('1.0.0-beta.2');

    expect(
      getTargetVersion(
        ['1.0.0-beta.1', '1.0.0-beta.2'] as SemVerVersion[],
        '^1.0.0-beta.1' as SemVerRange,
      ),
    ).toBe('1.0.0-beta.2');

    expect(
      getTargetVersion(
        ['1.0.0-alpha.2', '1.0.0-beta.1'] as SemVerVersion[],
        '*' as SemVerRange,
      ),
    ).toBe('1.0.0-beta.1');

    expect(
      getTargetVersion(
        ['0.9.0', '1.0.0-alpha.0'] as SemVerVersion[],
        '*' as SemVerRange,
      ),
    ).toBe('0.9.0');
  });

  it("doesn't return pre-release versions by default", () => {
    expect(
      getTargetVersion(
        ['1.0.0-beta.1', '1.0.0', '1.2.3'] as SemVerVersion[],
        '*' as SemVerRange,
      ),
    ).toBe('1.2.3');

    expect(
      getTargetVersion(
        ['1.0.0-beta.1', '1.0.0', '1.2.3'] as SemVerVersion[],
        '^1.0.0' as SemVerRange,
      ),
    ).toBe('1.2.3');

    expect(
      getTargetVersion(
        ['1.0.0-beta.1', '1.0.0'] as SemVerVersion[],
        '*' as SemVerRange,
      ),
    ).toBe('1.0.0');
  });
});
