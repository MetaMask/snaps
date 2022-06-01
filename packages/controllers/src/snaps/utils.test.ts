import { createReadStream } from 'fs';
import { readFile } from 'fs/promises';
import path from 'path';
import fetchMock from 'jest-fetch-mock';
import {
  DEFAULT_REQUESTED_SNAP_VERSION,
  fetchNpmSnap,
  getSnapPrefix,
  getTargetVersion,
  gtVersion,
  isValidSnapVersionRange,
  resolveVersion,
  satifiesVersionRange,
  SnapIdPrefixes,
} from './utils';

fetchMock.enableMocks();

describe('fetchNpmSnap', () => {
  beforeEach(() => {
    fetchMock.resetMocks();
  });

  it('fetches a package tarball, extracts the necessary files, and validates them', async () => {
    const { version: templateSnapVersion } = JSON.parse(
      (
        await readFile(require.resolve('@metamask/template-snap/package.json'))
      ).toString('utf8'),
    );

    const tarballUrl = `https://registry.npmjs.cf/@metamask/template-snap/-/template-snap-${templateSnapVersion}.tgz`;
    const tarballRegistry = `https://registry.npmjs.org/@metamask/template-snap/-/template-snap-${templateSnapVersion}.tgz`;
    fetchMock
      .mockResponseOnce(
        JSON.stringify({
          'dist-tags': {
            latest: templateSnapVersion,
          },
          versions: {
            [templateSnapVersion]: {
              dist: {
                // return npmjs.org registry here so that we can check overriding it with npmjs.cf works
                tarball: tarballRegistry,
              },
            },
          },
        }),
      )
      .mockResponseOnce(
        (_req) =>
          Promise.resolve({
            ok: true,
            body: createReadStream(
              path.resolve(
                __dirname,
                `../../test/fixtures/metamask-template-snap-${templateSnapVersion}.tgz`,
              ),
            ),
          }) as any,
      );

    const { manifest, sourceCode, svgIcon } = await fetchNpmSnap(
      '@metamask/template-snap',
      templateSnapVersion,
      'https://registry.npmjs.cf',
      fetchMock,
    );

    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(fetchMock).toHaveBeenNthCalledWith(
      1,
      'https://registry.npmjs.cf/@metamask/template-snap',
    );
    expect(fetchMock).toHaveBeenNthCalledWith(2, tarballUrl);

    expect(manifest).toStrictEqual(
      JSON.parse(
        (
          await readFile(
            require.resolve('@metamask/template-snap/snap.manifest.json'),
          )
        ).toString('utf8'),
      ),
    );

    expect(sourceCode).toStrictEqual(
      (
        await readFile(
          require.resolve('@metamask/template-snap/dist/bundle.js'),
        )
      ).toString('utf8'),
    );

    expect(svgIcon?.startsWith('<svg') && svgIcon.endsWith('</svg>')).toBe(
      true,
    );
  });
});

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
  });
});
