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
    expect(gtVersion('1.2.3' as SemVerVersion, '1.0.0' as SemVerVersion)).toBe(
      true,
    );

    expect(gtVersion('2.0.0' as SemVerVersion, '1.0.0' as SemVerVersion)).toBe(
      true,
    );

    expect(gtVersion('1.0.0' as SemVerVersion, '1.2.3' as SemVerVersion)).toBe(
      false,
    );

    expect(gtVersion('1.0.0' as SemVerVersion, '2.0.0' as SemVerVersion)).toBe(
      false,
    );
  });

  it('supports pre-release versions', () => {
    expect(
      gtVersion(
        '1.0.0-beta.2' as SemVerVersion,
        '1.0.0-beta.1' as SemVerVersion,
      ),
    ).toBe(true);

    expect(
      gtVersion('1.0.0-beta.2' as SemVerVersion, '1.2.3' as SemVerVersion),
    ).toBe(false);

    expect(
      gtVersion('1.0.0' as SemVerVersion, '1.0.0-beta.2' as SemVerVersion),
    ).toBe(true);

    expect(
      gtVersion('1.2.3-beta.1' as SemVerVersion, '1.0.0' as SemVerVersion),
    ).toBe(true);

    expect(
      gtVersion(
        '1.2.3-beta.1' as SemVerVersion,
        '1.2.3-alpha.2' as SemVerVersion,
      ),
    ).toBe(true);
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

describe('satisfiesVersionRange', () => {
  it('supports *', () => {
    expect(
      satisfiesVersionRange('3.0.0' as SemVerVersion, '*' as SemVerRange),
    ).toBe(true);
  });

  it('supports exact versions', () => {
    expect(
      satisfiesVersionRange(
        '1.0.0-beta.1' as SemVerVersion,
        '1.0.0-beta.1' as SemVerRange,
      ),
    ).toBe(true);

    expect(
      satisfiesVersionRange('1.0.0' as SemVerVersion, '1.0.0' as SemVerRange),
    ).toBe(true);

    expect(
      satisfiesVersionRange('1.2.3' as SemVerVersion, '1.0.0' as SemVerRange),
    ).toBe(false);
  });

  it('supports non-exact version ranges', () => {
    expect(
      satisfiesVersionRange('1.2.3' as SemVerVersion, '^1.0.0' as SemVerRange),
    ).toBe(true);

    expect(
      satisfiesVersionRange('2.0.0' as SemVerVersion, '^1.0.0' as SemVerRange),
    ).toBe(false);
  });

  it('pre-releases can satisfy version range', () => {
    expect(
      satisfiesVersionRange(
        '1.0.0-beta.1' as SemVerVersion,
        '*' as SemVerRange,
      ),
    ).toBe(true);

    expect(
      satisfiesVersionRange(
        '1.0.0-beta.1' as SemVerVersion,
        '^1.0.0' as SemVerRange,
      ),
    ).toBe(false);
  });
});
