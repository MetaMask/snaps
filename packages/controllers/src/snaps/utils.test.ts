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
    const { version: exampleSnapVersion } = JSON.parse(
      (
        await readFile(require.resolve('@metamask/example-snap/package.json'))
      ).toString('utf8'),
    );

    const expectedSvgContents = (
      await readFile(require.resolve('@metamask/example-snap/images/icon.svg'))
    ).toString('utf8');

    const tarballUrl = `https://registry.npmjs.org/@metamask/example-snap/-/example-snap-${exampleSnapVersion}.tgz`;
    fetchMock
      .mockResponseOnce(
        JSON.stringify({
          'dist-tags': {
            latest: exampleSnapVersion,
          },
          versions: {
            [exampleSnapVersion]: {
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
                `../../test/fixtures/metamask-example-snap-${exampleSnapVersion}.tgz`,
              ),
            ),
          }) as any,
      );

    const { manifest, sourceCode, svgIcon } = await fetchNpmSnap(
      '@metamask/example-snap',
      exampleSnapVersion,
    );

    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(fetchMock).toHaveBeenNthCalledWith(
      1,
      'https://registry.npmjs.org/@metamask/example-snap',
    );
    expect(fetchMock).toHaveBeenNthCalledWith(2, tarballUrl);

    expect(manifest).toStrictEqual(
      JSON.parse(
        (
          await readFile(
            require.resolve('@metamask/example-snap/snap.manifest.json'),
          )
        ).toString('utf8'),
      ),
    );

    expect(sourceCode).toStrictEqual(
      (
        await readFile(require.resolve('@metamask/example-snap/dist/bundle.js'))
      ).toString('utf8'),
    );

    expect(svgIcon).toStrictEqual(expectedSvgContents);
  });
});
