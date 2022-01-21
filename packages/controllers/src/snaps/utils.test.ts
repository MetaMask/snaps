import { createReadStream } from 'fs';
import { readFile } from 'fs/promises';
import path from 'path';
import fetchMock from 'jest-fetch-mock';
import { fetchNpmSnap } from './utils';

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
    fetchMock
      .mockResponseOnce(
        JSON.stringify({
          'dist-tags': {
            latest: templateSnapVersion,
          },
          versions: {
            [templateSnapVersion]: {
              dist: {
                tarball: tarballUrl,
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
