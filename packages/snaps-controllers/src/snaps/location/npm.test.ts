import type { SemVerRange } from '@metamask/utils';
import { assert } from '@metamask/utils';
import { createReadStream } from 'fs';
import { readFile } from 'fs/promises';
import fetchMock from 'jest-fetch-mock';
import path from 'path';
import { Readable } from 'stream';

import {
  DEFAULT_NPM_REGISTRY,
  NpmLocation,
  getNpmCanonicalBasePath,
} from './npm';

fetchMock.enableMocks();

describe('NpmLocation', () => {
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

    const customFetchMock = jest.fn();

    customFetchMock
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          // eslint-disable-next-line @typescript-eslint/naming-convention
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
      } as any)
      .mockResolvedValue({
        ok: true,
        // eslint-disable-next-line @typescript-eslint/naming-convention
        headers: new Headers({ 'content-length': '5477' }),
        body: Readable.toWeb(
          createReadStream(
            path.resolve(
              __dirname,
              `../../../test/fixtures/metamask-template-snap-${templateSnapVersion}.tgz`,
            ),
          ),
        ),
      } as any);

    const location = new NpmLocation(
      new URL('npm://registry.npmjs.cf/@metamask/template-snap'),
      {
        versionRange: templateSnapVersion,
        fetch: customFetchMock as typeof fetch,
        allowCustomRegistries: true,
      },
    );

    const manifest = await location.manifest();
    expect(manifest.path).toBe('snap.manifest.json');
    expect(manifest.data.canonicalPath).toBe(
      'npm://registry.npmjs.cf/@metamask/template-snap/snap.manifest.json',
    );
    const sourceCode = await location.fetch(
      manifest.result.source.location.npm.filePath,
    );
    expect(sourceCode.path).toBe('dist/bundle.js');
    expect(sourceCode.data.canonicalPath).toBe(
      'npm://registry.npmjs.cf/@metamask/template-snap/dist/bundle.js',
    );
    assert(manifest.result.source.location.npm.iconPath);
    const svgIcon = (
      await location.fetch(manifest.result.source.location.npm.iconPath)
    ).toString();

    expect(customFetchMock).toHaveBeenCalledTimes(2);
    expect(customFetchMock).toHaveBeenNthCalledWith(
      1,
      'https://registry.npmjs.cf/@metamask/template-snap',
      { headers: { accept: 'application/json' } },
    );
    expect(customFetchMock).toHaveBeenNthCalledWith(2, tarballUrl);

    expect(manifest.result).toStrictEqual(
      JSON.parse(
        (
          await readFile(
            require.resolve('@metamask/template-snap/snap.manifest.json'),
          )
        ).toString('utf8'),
      ),
    );

    expect(sourceCode.toString()).toStrictEqual(
      (
        await readFile(
          require.resolve('@metamask/template-snap/dist/bundle.js'),
        )
      ).toString('utf8'),
    );

    expect(svgIcon?.startsWith('<svg') && svgIcon.endsWith('</svg>')).toBe(
      true,
    );

    expect(location.version).toBe(templateSnapVersion);
  });

  it('fetches a package tarball directly without fetching the metadata when possible', async () => {
    const { version: templateSnapVersion } = JSON.parse(
      (
        await readFile(require.resolve('@metamask/template-snap/package.json'))
      ).toString('utf8'),
    );

    const customFetchMock = jest.fn();

    customFetchMock.mockResolvedValue({
      ok: true,
      // eslint-disable-next-line @typescript-eslint/naming-convention
      headers: new Headers({ 'content-length': '5477' }),
      body: Readable.toWeb(
        createReadStream(
          path.resolve(
            __dirname,
            `../../../test/fixtures/metamask-template-snap-${templateSnapVersion}.tgz`,
          ),
        ),
      ),
    } as any);

    const tarballUrl = `https://registry.npmjs.org/@metamask/template-snap/-/template-snap-${templateSnapVersion}.tgz`;

    const location = new NpmLocation(new URL('npm:@metamask/template-snap'), {
      versionRange: templateSnapVersion,
      fetch: customFetchMock as typeof fetch,
    });

    const manifest = await location.manifest();
    const sourceCode = (
      await location.fetch(manifest.result.source.location.npm.filePath)
    ).toString();
    assert(manifest.result.source.location.npm.iconPath);
    const svgIcon = (
      await location.fetch(manifest.result.source.location.npm.iconPath)
    ).toString();

    expect(customFetchMock).toHaveBeenCalledTimes(1);
    expect(customFetchMock).toHaveBeenNthCalledWith(1, tarballUrl);

    expect(manifest.result).toStrictEqual(
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

    expect(location.version).toBe(templateSnapVersion);
  });

  it('falls back to zlib if DecompressionStream is unavailable', async () => {
    // @ts-expect-error Deleting DecompressionStream for testing reasons
    delete globalThis.DecompressionStream;

    const { version: templateSnapVersion } = JSON.parse(
      (
        await readFile(require.resolve('@metamask/template-snap/package.json'))
      ).toString('utf8'),
    );

    const customFetchMock = jest.fn();

    customFetchMock.mockResolvedValue({
      ok: true,
      // eslint-disable-next-line @typescript-eslint/naming-convention
      headers: new Headers({ 'content-length': '5477' }),
      body: Readable.toWeb(
        createReadStream(
          path.resolve(
            __dirname,
            `../../../test/fixtures/metamask-template-snap-${templateSnapVersion}.tgz`,
          ),
        ),
      ),
    } as any);

    const tarballUrl = `https://registry.npmjs.org/@metamask/template-snap/-/template-snap-${templateSnapVersion}.tgz`;

    const location = new NpmLocation(new URL('npm:@metamask/template-snap'), {
      versionRange: templateSnapVersion,
      fetch: customFetchMock as typeof fetch,
    });

    const manifest = await location.manifest();
    const sourceCode = (
      await location.fetch(manifest.result.source.location.npm.filePath)
    ).toString();
    assert(manifest.result.source.location.npm.iconPath);
    const svgIcon = (
      await location.fetch(manifest.result.source.location.npm.iconPath)
    ).toString();

    expect(customFetchMock).toHaveBeenCalledTimes(1);
    expect(customFetchMock).toHaveBeenNthCalledWith(1, tarballUrl);

    expect(manifest.result).toStrictEqual(
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

  it('throws if fetch fails', async () => {
    fetchMock.mockResponse(async () => ({ status: 404, body: 'Not found' }));
    const location = new NpmLocation(new URL('npm:@metamask/template-snap'));
    await expect(location.manifest()).rejects.toThrow(
      'Failed to fetch NPM registry entry. Status code: 404.',
    );
    await expect(location.fetch('foo')).rejects.toThrow(
      'Failed to fetch NPM registry entry. Status code: 404.',
    );
  });

  it('throws if fetching the NPM tarball fails', async () => {
    const { version: templateSnapVersion } = JSON.parse(
      (
        await readFile(require.resolve('@metamask/template-snap/package.json'))
      ).toString('utf8'),
    );

    const tarballRegistry = `https://registry.npmjs.org/@metamask/template-snap/-/template-snap-${templateSnapVersion}.tgz`;

    const customFetchMock = jest.fn();

    customFetchMock
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          // eslint-disable-next-line @typescript-eslint/naming-convention
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
      } as any)
      .mockResolvedValue({
        ok: false,
        body: null,
      } as any);

    const location = new NpmLocation(new URL('npm:@metamask/template-snap'), {
      versionRange: templateSnapVersion,
      fetch: customFetchMock as typeof fetch,
    });

    await expect(location.manifest()).rejects.toThrow(
      'Failed to fetch tarball for package "@metamask/template-snap"',
    );
  });

  it('throws if the NPM tarball URL is invalid', async () => {
    const { version: templateSnapVersion } = JSON.parse(
      (
        await readFile(require.resolve('@metamask/template-snap/package.json'))
      ).toString('utf8'),
    );

    const customFetchMock = jest.fn();

    customFetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        // eslint-disable-next-line @typescript-eslint/naming-convention
        'dist-tags': {
          latest: templateSnapVersion,
        },
        versions: {
          [templateSnapVersion]: {
            dist: {
              tarball: 'foo',
            },
          },
        },
      }),
    } as any);

    const location = new NpmLocation(new URL('npm:@metamask/template-snap'), {
      versionRange: '*' as SemVerRange,
      fetch: customFetchMock as typeof fetch,
    });

    await expect(location.manifest()).rejects.toThrow(
      `Failed to find valid tarball URL in NPM metadata for package "@metamask/template-snap".`,
    );
  });

  it("can't use custom registries by default", () => {
    expect(
      () =>
        new NpmLocation(
          new URL('npm://registry.npmjs.cf/@metamask/template-snap'),
        ),
    ).toThrow(
      'Custom NPM registries are disabled, tried to use "https://registry.npmjs.cf/"',
    );
  });

  it.each(['foo:bar@registry.com', 'foo@registry.com'])(
    'supports registries with usernames and passwords',
    (host) => {
      const location = new NpmLocation(new URL(`npm://${host}/snap`), {
        allowCustomRegistries: true,
      });
      expect(location.registry.toString()).toBe(`https://${host}/`);
    },
  );

  it('has meta properties', () => {
    const location = new NpmLocation(new URL('npm:foo'));
    expect(location.packageName).toBe('foo');
    expect(location.registry.toString()).toBe('https://registry.npmjs.org/');
    expect(location.versionRange).toBe('*');
    expect(() => location.version).toThrow(
      'Tried to access version without first fetching NPM package.',
    );
  });

  // TODO(ritave): Doing this tests requires writing tarball packing utility function
  //               With the current changeset going way out of scope, I'm leaving this for future.
  it.todo('sets canonical path properly');
  // TODO(ritave): Requires writing tarball packing utility out of scope for a hot-fix blocking release.
  it.todo('paths are normalized to remove "./" prefix');
});

describe('getNpmCanonicalBasePath', () => {
  it('returns the default base path', () => {
    expect(
      getNpmCanonicalBasePath(DEFAULT_NPM_REGISTRY, '@metamask/example-snap'),
    ).toBe('npm://registry.npmjs.org/@metamask/example-snap/');
  });

  it('returns a path for a custom registry', () => {
    expect(
      getNpmCanonicalBasePath(
        new URL('https://foo:bar@registry.com/'),
        '@metamask/example-snap',
      ),
    ).toBe('npm://foo:bar@registry.com/@metamask/example-snap/');
  });
});
