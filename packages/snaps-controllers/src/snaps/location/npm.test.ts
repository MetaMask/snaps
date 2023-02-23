import { assert } from '@metamask/utils';
import { createReadStream } from 'fs';
import { readFile } from 'fs/promises';
import fetchMock from 'jest-fetch-mock';
import path from 'path';

import { NpmLocation } from './npm';

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
    fetchMock
      .mockResponseOnce(
        JSON.stringify({
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
      )
      .mockResponseOnce(
        (_req) =>
          Promise.resolve({
            ok: true,
            // eslint-disable-next-line @typescript-eslint/naming-convention
            headers: new Headers({ 'content-length': '5477' }),
            body: createReadStream(
              path.resolve(
                __dirname,
                `../../../test/fixtures/metamask-template-snap-${templateSnapVersion}.tgz`,
              ),
            ),
          }) as any,
      );

    const location = new NpmLocation(
      new URL('npm://registry.npmjs.cf/@metamask/template-snap'),
      {
        versionRange: templateSnapVersion,
        fetch: fetchMock as typeof fetch,
        allowCustomRegistries: true,
      },
    );

    const manifest = await location.manifest();
    const sourceCode = (
      await location.fetch(manifest.result.source.location.npm.filePath)
    ).value.toString();
    assert(manifest.result.source.location.npm.iconPath);
    const svgIcon = (
      await location.fetch(manifest.result.source.location.npm.iconPath)
    ).value.toString();

    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(fetchMock).toHaveBeenNthCalledWith(
      1,
      'https://registry.npmjs.cf/@metamask/template-snap',
    );
    expect(fetchMock).toHaveBeenNthCalledWith(2, tarballUrl);

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
  //               With the the current changeset going way out of scope, I'm leaving this for future.
  it.todo('sets canonical path properly');
  // TODO(ritave): Requires writing tarball packing utility out of scope for a hot-fix blocking release.
  it.todo('paths are normalized to remove "./" prefix');
});
