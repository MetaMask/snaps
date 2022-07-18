import {
  DEFAULT_REQUESTED_SNAP_VERSION,
  getTargetVersion,
  gtVersion,
  isValidSnapVersionRange,
  resolveVersion,
  satifiesVersionRange,
} from './versions';
import { getSnapPrefix } from './snaps';
import { SnapIdPrefixes } from './types';

describe('resolveVersion', () => {
  it('defaults "latest" to DEFAULT_REQUESTED_SNAP_VERSION', () => {
    expect(resolveVersion('latest')).toBe(DEFAULT_REQUESTED_SNAP_VERSION);
  });

  it('defaults an undefined version to DEFAULT_REQUESTED_SNAP_VERSION', () => {
    expect(resolveVersion(undefined)).toBe(DEFAULT_REQUESTED_SNAP_VERSION);
  });

  it('returns the requested version for everything else', () => {
    expect(resolveVersion('1.2.3')).toBe('1.2.3');
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

describe('isValidSnapVersionRange', () => {
  it('supports *', () => {
    expect(isValidSnapVersionRange('*')).toBe(true);
  });

  it('supports normal version ranges', () => {
    expect(isValidSnapVersionRange('^1.2.3')).toBe(true);
    expect(isValidSnapVersionRange('1.5.0')).toBe(true);
  });

  it('supports pre-release versions', () => {
    expect(isValidSnapVersionRange('1.0.0-beta.1')).toBe(true);
    expect(isValidSnapVersionRange('^1.0.0-beta.1')).toBe(true);
  });

  it('rejects non strings', () => {
    expect(isValidSnapVersionRange(null)).toBe(false);
    expect(isValidSnapVersionRange(undefined)).toBe(false);
    expect(isValidSnapVersionRange(2)).toBe(false);
    expect(isValidSnapVersionRange(true)).toBe(false);
    expect(isValidSnapVersionRange({})).toBe(false);
  });
});

describe('gtVersion', () => {
  it('supports regular versions', () => {
    expect(gtVersion('1.2.3', '1.0.0')).toBe(true);
    expect(gtVersion('2.0.0', '1.0.0')).toBe(true);
    expect(gtVersion('1.0.0', '1.2.3')).toBe(false);
    expect(gtVersion('1.0.0', '2.0.0')).toBe(false);
  });

  it('supports pre-release versions', () => {
    expect(gtVersion('1.0.0-beta.2', '1.0.0-beta.1')).toBe(true);
    expect(gtVersion('1.0.0-beta.2', '1.2.3')).toBe(false);
    expect(gtVersion('1.0.0', '1.0.0-beta.2')).toBe(true);
    expect(gtVersion('1.2.3-beta.1', '1.0.0')).toBe(true);
    expect(gtVersion('1.2.3-beta.1', '1.2.3-alpha.2')).toBe(true);
  });
});

describe('getTargetVersion', () => {
  it('supports *', () => {
    expect(getTargetVersion(['1.2.3', '3.0.0'], '*')).toBe('3.0.0');
  });

  it('supports pre-release versions', () => {
    expect(getTargetVersion(['1.0.0-beta.1'], '*')).toBe('1.0.0-beta.1');
    expect(getTargetVersion(['1.0.0-beta.1', '1.0.0-beta.2'], '*')).toBe(
      '1.0.0-beta.2',
    );

    expect(
      getTargetVersion(['1.0.0-beta.1', '1.0.0-beta.2'], '^1.0.0-beta.1'),
    ).toBe('1.0.0-beta.2');

    expect(getTargetVersion(['1.0.0-alpha.2', '1.0.0-beta.1'], '*')).toBe(
      '1.0.0-beta.1',
    );

    expect(getTargetVersion(['0.9.0', '1.0.0-alpha.0'], '*')).toBe('0.9.0');
  });

  it('doesnt return pre-release versions by default', () => {
    expect(getTargetVersion(['1.0.0-beta.1', '1.0.0', '1.2.3'], '*')).toBe(
      '1.2.3',
    );

    expect(getTargetVersion(['1.0.0-beta.1', '1.0.0', '1.2.3'], '^1.0.0')).toBe(
      '1.2.3',
    );
    expect(getTargetVersion(['1.0.0-beta.1', '1.0.0'], '*')).toBe('1.0.0');
  });
});

describe('satifiesVersionRange', () => {
  it('supports *', () => {
    expect(satifiesVersionRange('3.0.0', '*')).toBe(true);
  });

  it('supports exact versions', () => {
    expect(satifiesVersionRange('1.0.0-beta.1', '1.0.0-beta.1')).toBe(true);
    expect(satifiesVersionRange('1.0.0', '1.0.0')).toBe(true);
    expect(satifiesVersionRange('1.2.3', '1.0.0')).toBe(false);
  });

  it('supports non-exact version ranges', () => {
    expect(satifiesVersionRange('1.2.3', '^1.0.0')).toBe(true);
    expect(satifiesVersionRange('2.0.0', '^1.0.0')).toBe(false);
  });

  it('prereleases can satisfy version range', () => {
    expect(satifiesVersionRange('1.0.0-beta.1', '*')).toBe(true);
    expect(satifiesVersionRange('1.0.0-beta.1', '^1.0.0')).toBe(false);
  });
});
